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
exports.determineFileAndChangeType = void 0;
const utils_1 = require("./utils");
const path = require("path");
const CreateAutomatedTests_1 = require("../discovery/CreateAutomatedTests");
const logger_1 = require("./logger");
const SyncResults_1 = require("../discovery/SyncResults");
const LOGGER = new logger_1.default("fileTypeUtils.ts");
const GUI_TEST_TYPE = "GUI";
const API_TEST_TYPE = "API";
const TSP_FILE_EXTENSION = ".tsp";
const ST_FILE_EXTENSION = ".st";
const determineFileAndChangeType = (modifiedFiles, discoveredTests, existingTests) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const rootFolder = process.env.BUILD_SOURCESDIRECTORY || process.env.GITHUB_WORKSPACE || process.env.CI_PROJECT_DIR || "";
    const modifiedTestsMap = [];
    const testsToDelete = [];
    const addedTests = [];
    const removedDataTables = [];
    const modifiedDataTables = [];
    const addedDataTables = [];
    const re = /\.(xlsx|xls)$/;
    for (let i = 0; i < modifiedFiles.length;) {
        const status = modifiedFiles[i++];
        if (!status)
            continue;
        if (status.startsWith("R")) {
            const oldPath = (_a = modifiedFiles[i++]) !== null && _a !== void 0 ? _a : "";
            const newPath = (_b = modifiedFiles[i++]) !== null && _b !== void 0 ? _b : "";
            if ((oldPath && oldPath.match(/\.(st|tsp)$/)) ||
                (newPath && newPath.match(/\.(st|tsp)$/))) {
                const classNameOld = (0, utils_1.getClassNameAtSync)(oldPath);
                const oldTest = {
                    name: (0, utils_1.getTestNameAtSync)(oldPath),
                    packageName: (0, utils_1.getPackageNameAtSync)(classNameOld),
                    className: classNameOld,
                };
                const classNameNew = (0, utils_1.getClassNameAtSync)(newPath);
                const newTest = {
                    name: (0, utils_1.getTestNameAtSync)(newPath),
                    packageName: (0, utils_1.getPackageNameAtSync)(classNameNew),
                    className: classNameNew,
                };
                modifiedTestsMap.push({ oldValue: oldTest, newValue: newTest });
                LOGGER.debug(`Mapped: ${oldPath} → ${newPath}`);
            }
            else if ((oldPath && re.test(oldPath.toLowerCase())) ||
                (newPath && re.test(newPath.toLowerCase()))) {
                const oldDataTable = {
                    name: path.basename(oldPath),
                    relativePath: oldPath,
                };
                const newDataTable = {
                    name: path.basename(newPath),
                    relativePath: newPath,
                };
                const filteredModifiedDataTables = yield (0, utils_1.removeFalsePositiveDataTablesAtUpdate)(discoveredTests, [
                    newDataTable,
                ]);
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
            const deletedFile = (_c = modifiedFiles[i++]) !== null && _c !== void 0 ? _c : "";
            if (deletedFile && deletedFile.match(/\.(st|tsp)$/)) {
                const className = (0, utils_1.getClassNameAtSync)(deletedFile);
                const testToDelete = {
                    name: (0, utils_1.getTestNameAtSync)(deletedFile),
                    packageName: (0, utils_1.getPackageNameAtSync)(className),
                    className: className,
                    isExecutable: false,
                };
                testsToDelete.push(testToDelete);
            }
            else if (deletedFile && re.test(deletedFile.toLowerCase())) {
                const deletedDataTable = {
                    name: path.basename(deletedFile),
                    relativePath: deletedFile,
                };
                const filteredRemovedDataTables = yield (0, utils_1.removeFalsePositiveDataTablesAtUpdate)(existingTests, [
                    deletedDataTable,
                ]);
                if (filteredRemovedDataTables.length === 0) {
                    LOGGER.debug("The removed data table is a false positive. " +
                        deletedDataTable.name);
                    continue;
                }
                removedDataTables.push(deletedDataTable);
            }
            continue;
        }
        if (status === "A") {
            const addedFile = modifiedFiles[i++];
            if (addedFile && addedFile.match(/\.(st|tsp)$/)) {
                const addedFileRenamed = rootFolder + "\\" + addedFile.replace(/\//g, "\\");
                if (addedFile.endsWith(TSP_FILE_EXTENSION)) {
                    const addGUITest = yield (0, CreateAutomatedTests_1.createAutomatedTestsFromGUI)(path.dirname(addedFileRenamed), GUI_TEST_TYPE);
                    addedTests.push(addGUITest);
                }
                else if (addedFile.endsWith(ST_FILE_EXTENSION)) {
                    const addAPITest = yield (0, CreateAutomatedTests_1.createAutomatedTestFromAPI)(path.dirname(addedFileRenamed), API_TEST_TYPE);
                    addedTests.push(addAPITest);
                }
            }
            else if (addedFile && re.test(addedFile.toLowerCase())) {
                const newDataTable = {
                    name: path.basename(addedFile),
                    relativePath: addedFile,
                };
                addedDataTables.push(newDataTable);
            }
        }
    }
    return new SyncResults_1.default(addedTests, addedDataTables, modifiedTestsMap, modifiedDataTables, testsToDelete, removedDataTables);
});
exports.determineFileAndChangeType = determineFileAndChangeType;
