"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ScanRepo_1 = require("./ScanRepo");
const octaneConnectionUtils_1 = require("../utils/octaneConnectionUtils");
const logger_1 = require("../utils/logger");
const path = require("path");
const octaneClient_1 = require("./octaneClient");
const utils_1 = require("../utils/utils");
const CreateAutomatedTests_1 = require("./CreateAutomatedTests");
const fs_1 = require("fs");
const LOGGER = new logger_1.default("Discovery.ts");
class Discovery {
    constructor(isFullScan, octaneUrl, sharedSpace, workspace, clientId, clientSecret) {
        this.GUI_TEST_TYPE = "GUI";
        this.API_TEST_TYPE = "API";
        this.isFullScan = isFullScan;
        this.octaneUrl = octaneUrl;
        this.sharedSpace = sharedSpace;
        this.workspace = workspace;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.octaneSDKConnection = {};
        this.octaneApi = `/api/shared_spaces/${sharedSpace}/workspaces/${workspace}`;
    }
    initializeOctaneConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = octaneConnectionUtils_1.OctaneConnectionUtils.getNewOctaneConnection(this.octaneUrl, this.sharedSpace, this.workspace, this.clientId, this.clientSecret);
                yield connection._requestHandler.authenticate();
                this.octaneSDKConnection = connection;
            }
            catch (e) {
                throw new Error("Failed to initialize Octane connection. " + e.message);
            }
        });
    }
    startDiscovery(path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializeOctaneConnection();
            const repoID = yield (0, octaneClient_1.getScmRepo)(this.octaneSDKConnection, this.octaneApi);
            const scanner = new ScanRepo_1.default(path);
            const discovery = yield scanner.scanRepo(path);
            const discoveredTests = discovery.getAllTests();
            if (discoveredTests.length === 0) {
                LOGGER.warn("No UFT tests have been discovered in the repository.");
            }
            const scmResourceFiles = discovery.getAllScmResourceFiles();
            if (scmResourceFiles.length === 0) {
                LOGGER.warn("No data tables have been discovered in the repository.");
            }
            const filteredScmResourceFiles = yield (0, utils_1.removeFalsePositiveDataTables)(discoveredTests, scmResourceFiles);
            const modifiedTests = yield this.getModifiedTestsAndDataTables(discoveredTests, filteredScmResourceFiles);
            yield this.sendTestEventsToOctane(modifiedTests, repoID);
        });
    }
    getModifiedFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const path = process.env.MODIFIED_FILES_PATH;
            if (!path) {
                return [];
            }
            const gitOutput = (0, fs_1.readFileSync)(path, "utf8");
            return gitOutput.split("\0").filter(Boolean);
        });
    }
    sendTestEventsToOctane(modifiedTests, repoRootID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const test of modifiedTests) {
                    LOGGER.debug("the change type of test " + test.name + " is: " + test.changeType);
                    if (test.changeType === 'deleted') {
                        if (test.id) {
                            yield (0, octaneClient_1.makeTestNotExecutableInOctane)(this.octaneSDKConnection, test.id);
                        }
                    }
                    else if (test.changeType === 'modified') {
                        if (test.id) {
                            yield (0, octaneClient_1.sendUpdateTestEventToOctane)(this.octaneSDKConnection, test.id, test.name, test.packageName, test.description, test.className, test.isExecutable);
                        }
                    }
                    else if (test.changeType === 'added') {
                        yield (0, octaneClient_1.sendCreateTestEventToOctane)(this.octaneSDKConnection, this.octaneApi, test.name, test.packageName, test.className, test.description, repoRootID);
                    }
                }
            }
            catch (e) {
                LOGGER.error("Failed to send test events to Octane. " + e.message);
                throw new Error("Failed to send test events to Octane. " + e.message);
            }
        });
    }
    sendDataTableEventsToOctane(modifiedDataTables, repoRootID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const dataTable of modifiedDataTables) {
                    LOGGER.debug("The change type of data table " + dataTable.name + " is: " + dataTable.changeType);
                    if (dataTable.changeType === "added") {
                        yield (0, octaneClient_1.createScmResourceFile)(this.octaneSDKConnection, this.octaneApi, dataTable.name, dataTable.relativePath, repoRootID);
                    }
                    else if (dataTable.changeType === "modified") {
                        if (dataTable.id) {
                            yield (0, octaneClient_1.updateScmResourceFile)(this.octaneSDKConnection, this.octaneApi, dataTable.id, dataTable.name, dataTable.relativePath);
                        }
                    }
                    else if (dataTable.changeType === "deleted") {
                        if (dataTable.id) {
                            yield (0, octaneClient_1.deleteScmResourceFile)(this.octaneSDKConnection, this.octaneApi, dataTable.id);
                        }
                    }
                }
            }
            catch (e) {
                LOGGER.error("Failed to send scm resource files events to Octane. " + e.message);
                throw new Error("Failed to scm resource files test events to Octane. " + e.message);
            }
        });
    }
    getModifiedTestsAndDataTables(discoveredTests, discoveredScmResourceFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const repoID = yield (0, octaneClient_1.getScmRepo)(this.octaneSDKConnection, this.octaneApi);
            let existingTests;
            if (this.isFullScan) {
                existingTests = yield (0, octaneClient_1.getExistingUFTTests)(this.octaneSDKConnection);
            }
            else {
                existingTests = yield (0, octaneClient_1.getExistingTestsInScmRepo)(this.octaneSDKConnection, repoID);
            }
            const changedTests = [];
            const rootFolder = process.env.BUILD_SOURCESDIRECTORY || "";
            const modifiedFilesArray = yield this.getModifiedFiles();
            LOGGER.debug("The modified files array is: " + modifiedFilesArray);
            const modifiedTestsMap = [];
            const testsToDelete = [];
            const addedTests = [];
            const removedDataTables = [];
            const modifiedDataTables = [];
            const addedDataTables = [];
            for (let i = 0; i < modifiedFilesArray.length;) {
                const status = modifiedFilesArray[i++];
                if (!status)
                    continue;
                if (status.startsWith("R")) {
                    const oldPath = (_a = modifiedFilesArray[i++]) !== null && _a !== void 0 ? _a : "";
                    const newPath = (_b = modifiedFilesArray[i++]) !== null && _b !== void 0 ? _b : "";
                    if ((oldPath && oldPath.match(/\.(st|tsp)$/)) || (newPath && newPath.match(/\.(st|tsp)$/))) {
                        const classNameOld = (0, utils_1.getClassNameAtSync)(oldPath);
                        const oldTest = {
                            name: (0, utils_1.getTestNameAtSync)(oldPath),
                            packageName: (0, utils_1.getPackageNameAtSync)(classNameOld),
                            className: classNameOld
                        };
                        const classNameNew = (0, utils_1.getClassNameAtSync)(newPath);
                        const newTest = {
                            name: (0, utils_1.getTestNameAtSync)(newPath),
                            packageName: (0, utils_1.getPackageNameAtSync)(classNameNew),
                            className: classNameNew
                        };
                        modifiedTestsMap.push({ oldValue: oldTest, newValue: newTest });
                        LOGGER.debug(`Mapped: ${oldPath} → ${newPath}`);
                    }
                    else if ((oldPath && oldPath.match(/\.(xlsx|xls)$/)) || (newPath && newPath.match(/\.(xlsx|xls)$/))) {
                        const oldDataTable = {
                            name: path.basename(oldPath),
                            relativePath: oldPath
                        };
                        const newDataTable = {
                            name: path.basename(newPath),
                            relativePath: newPath
                        };
                        const filteredModifiedDataTables = yield (0, utils_1.removeFalsePositiveDataTablesAtUpdate)(discoveredTests, [newDataTable]);
                        if (filteredModifiedDataTables.length === 0) {
                            LOGGER.debug("The modified data table is a false positive. " + newDataTable.name);
                            continue;
                        }
                        modifiedDataTables.push({
                            oldValue: oldDataTable,
                            newValue: newDataTable,
                        });
                        LOGGER.debug(`Mapped data table: ${oldPath} → ${newPath}`);
                    }
                    continue;
                }
                if (status === "D") {
                    const deletedFile = (_c = modifiedFilesArray[i++]) !== null && _c !== void 0 ? _c : "";
                    if (deletedFile && deletedFile.match(/\.(st|tsp)$/)) {
                        const className = (0, utils_1.getClassNameAtSync)(deletedFile);
                        const testToDelete = {
                            name: (0, utils_1.getTestNameAtSync)(deletedFile),
                            packageName: (0, utils_1.getPackageNameAtSync)(className),
                            className: className,
                            isExecutable: false
                        };
                        testsToDelete.push(testToDelete);
                    }
                    else if (deletedFile && deletedFile.match(/\.(xlsx|xls)$/)) {
                        const deletedDataTable = {
                            name: path.basename(deletedFile),
                            relativePath: deletedFile
                        };
                        const filteredRemovedDataTables = yield (0, utils_1.removeFalsePositiveDataTablesAtUpdate)(existingTests, [deletedDataTable]);
                        if (filteredRemovedDataTables.length === 0) {
                            LOGGER.debug("The removed data table is a false positive. " + deletedDataTable.name);
                            continue;
                        }
                        removedDataTables.push(deletedDataTable);
                    }
                    continue;
                }
                if (status === "A") {
                    const addedFile = modifiedFilesArray[i++];
                    if (addedFile && addedFile.match(/\.(st|tsp)$/)) {
                        const addedFileRenamed = rootFolder + "\\" + addedFile.replace(/\//g, "\\");
                        if (addedFile.endsWith(".tsp")) {
                            const addGUITest = yield (0, CreateAutomatedTests_1.createAutomatedTestsFromGUI)(path.dirname(addedFileRenamed), this.GUI_TEST_TYPE);
                            addedTests.push(addGUITest);
                        }
                        else if (addedFile.endsWith(".st")) {
                            const addAPITest = yield (0, CreateAutomatedTests_1.createAutomatedTestFromAPI)(path.dirname(addedFileRenamed), this.API_TEST_TYPE);
                            addedTests.push(addAPITest);
                        }
                    }
                    else if (addedFile && addedFile.match(/\.(xlsx|xls)$/)) {
                        const newDataTable = {
                            name: path.basename(addedFile),
                            relativePath: addedFile
                        };
                        addedDataTables.push(newDataTable);
                    }
                }
            }
            for (const addedTest of addedTests) {
                let isExecutable = true;
                let testId;
                const testExists = existingTests.some(test => {
                    if (test.name === addedTest.name &&
                        test.className === addedTest.className &&
                        (test.packageName === addedTest.packageName || test.packageName === null || test.packageName === "")) {
                        if (!test.isExecutable) {
                            isExecutable = false;
                            testId = test.id;
                        }
                        return true;
                    }
                    return false;
                });
                if (testExists) {
                    if (isExecutable) {
                        LOGGER.info("The added test already exists in Octane: " + JSON.stringify(addedTest) + ". With the id: " + testId);
                    }
                    else {
                        LOGGER.info("The added test: " + JSON.stringify(addedTest) + " already exists in Octane but is not executable. Making it executable. With the id: " + testId);
                        changedTests.push(Object.assign(Object.assign({}, addedTest), { changeType: 'modified', id: testId, isExecutable: true }));
                    }
                }
                else {
                    changedTests.push(Object.assign(Object.assign({}, addedTest), { changeType: 'added' }));
                }
            }
            for (const test of testsToDelete) {
                let testId;
                const foundTest = existingTests.some(testE => {
                    if (testE.name === test.name &&
                        testE.className === test.className &&
                        (testE.packageName === test.packageName || testE.packageName === null || testE.packageName === "")) {
                        testId = testE.id;
                        return true;
                    }
                    return false;
                });
                if (foundTest) {
                    changedTests.push(Object.assign(Object.assign({}, test), { changeType: 'deleted', id: testId }));
                }
                else {
                    LOGGER.warn("Could not find the existing test to delete: " + JSON.stringify(test));
                }
            }
            for (const pair of modifiedTestsMap) {
                let testId;
                const foundTest = existingTests.some(testE => {
                    if (testE.name === pair.oldValue.name &&
                        testE.className === pair.oldValue.className &&
                        (testE.packageName === pair.oldValue.packageName || testE.packageName === null || testE.packageName === "")) {
                        testId = testE.id;
                        return true;
                    }
                    return false;
                });
                if (foundTest) {
                    changedTests.push(Object.assign(Object.assign({}, pair.newValue), { changeType: "modified", id: testId, isExecutable: true }));
                }
                else {
                    LOGGER.warn(`Could not find the existing test for modification: ${pair.oldValue.name}. Adding it as new test.`);
                    changedTests.push(Object.assign(Object.assign({}, pair.newValue), { changeType: "added" }));
                }
            }
            for (const test of discoveredTests) {
                const existsInAdded = addedTests.some(addedTest => addedTest.name === test.name &&
                    addedTest.className === test.className &&
                    addedTest.packageName === test.packageName);
                if (existsInAdded) {
                    continue;
                }
                const existsInModified = modifiedTestsMap.some(pair => (pair.oldValue.name === test.name &&
                    pair.oldValue.className === test.className &&
                    pair.oldValue.packageName === test.packageName)
                    || (pair.newValue.name === test.name &&
                        pair.newValue.className === test.className &&
                        pair.newValue.packageName === test.packageName));
                if (existsInModified) {
                    continue;
                }
                const foundTest = existingTests.find(testE => testE.name === test.name &&
                    testE.className === test.className &&
                    (testE.packageName === test.packageName || testE.packageName === null || testE.packageName === ""));
                if (foundTest) {
                    if (!foundTest.isExecutable) {
                        LOGGER.info("The discovered test: " + JSON.stringify(test) + " already exists in Octane but is not executable. Making it executable. With the id: " + foundTest.id);
                        changedTests.push(Object.assign(Object.assign({}, test), { changeType: "modified", id: foundTest.id, isExecutable: true }));
                    }
                    else {
                        LOGGER.info("The test already exists in Octane: " + JSON.stringify(foundTest) + " with id: " + foundTest.id);
                    }
                    continue;
                }
                changedTests.push(Object.assign(Object.assign({}, test), { changeType: "added" }));
            }
            LOGGER.debug("The changed tests are: " + JSON.stringify(changedTests));
            const filteredAddedDataTables = yield (0, utils_1.removeFalsePositiveDataTablesAtUpdate)(discoveredTests, addedDataTables);
            yield this.getModifiedScmResourceFiles(filteredAddedDataTables, removedDataTables, modifiedDataTables, discoveredScmResourceFiles);
            return changedTests;
        });
    }
    getModifiedScmResourceFiles(addedDataTables, deletedDataTables, modifiedDataTables, discoveredDataTables) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoID = yield (0, octaneClient_1.getScmRepo)(this.octaneSDKConnection, this.octaneApi);
            const existingDataTables = yield (0, octaneClient_1.getScmResourceFilesFromOctane)(this.octaneSDKConnection, this.octaneApi, repoID);
            const changedDataTables = [];
            for (const dataTable of addedDataTables) {
                let dataTableId;
                const exists = existingDataTables.some(existingDataTable => {
                    if (existingDataTable.name === dataTable.name && existingDataTable.relativePath === dataTable.relativePath) {
                        dataTableId = existingDataTable.id;
                        return true;
                    }
                    return false;
                });
                if (exists) {
                    LOGGER.info("The added data table already exists in Octane: " + JSON.stringify(dataTable) + ". With the id: " + dataTableId);
                    continue;
                }
                changedDataTables.push(Object.assign(Object.assign({}, dataTable), { changeType: "added" }));
            }
            for (const dataTable of deletedDataTables) {
                let dataTableId;
                const dataTableToDelete = existingDataTables.some(existingDataTable => {
                    if (existingDataTable.name === dataTable.name && existingDataTable.relativePath === dataTable.relativePath) {
                        dataTableId = existingDataTable.id;
                        return true;
                    }
                    return false;
                });
                if (dataTableToDelete) {
                    changedDataTables.push(Object.assign(Object.assign({}, dataTable), { id: dataTableId, changeType: "deleted" }));
                }
                else {
                    LOGGER.warn("Could not find the data table to delete: " + JSON.stringify(dataTable));
                }
            }
            for (const dataTable of modifiedDataTables) {
                let dataTableId;
                const existingDataTable = existingDataTables.some(existingDataTable => {
                    if (existingDataTable.name === dataTable.oldValue.name && existingDataTable.relativePath === dataTable.oldValue.relativePath) {
                        dataTableId = existingDataTable.id;
                        return true;
                    }
                    return false;
                });
                if (existingDataTable) {
                    changedDataTables.push(Object.assign(Object.assign({}, dataTable.newValue), { id: dataTableId, changeType: "modified" }));
                }
                else {
                    LOGGER.info("Could not find the existing data table for modification: " + JSON.stringify(dataTable.oldValue) + ". Adding it as new data table.");
                    changedDataTables.push(Object.assign(Object.assign({}, dataTable.newValue), { changeType: "added" }));
                }
            }
            for (const dataTable of discoveredDataTables) {
                const existsInAdded = addedDataTables.some(addedDataTable => addedDataTable.name === dataTable.name && addedDataTable.relativePath === dataTable.relativePath);
                if (existsInAdded) {
                    continue;
                }
                const existsInModified = modifiedDataTables.some(pair => (pair.oldValue.name === dataTable.name && pair.oldValue.relativePath === dataTable.relativePath)
                    || (pair.newValue.name === dataTable.name && pair.newValue.relativePath === dataTable.relativePath));
                if (existsInModified) {
                    continue;
                }
                const foundDataTable = existingDataTables.find(existingDataTable => existingDataTable.name === dataTable.name && existingDataTable.relativePath === dataTable.relativePath);
                if (foundDataTable) {
                    LOGGER.info("The data table already exists in Octane: " + JSON.stringify(foundDataTable) + " with id: " + foundDataTable.id);
                    continue;
                }
                changedDataTables.push(Object.assign(Object.assign({}, dataTable), { changeType: "added" }));
            }
            LOGGER.debug("The changed data tables are final: " + JSON.stringify(changedDataTables));
            yield this.sendDataTableEventsToOctane(changedDataTables, repoID);
        });
    }
}
exports.default = Discovery;
