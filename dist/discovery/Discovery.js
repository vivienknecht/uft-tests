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
const octaneClient_1 = require("./octaneClient");
const utils_1 = require("../utils/utils");
const fs_1 = require("fs");
const OctaneSyncService_1 = require("./OctaneSyncService");
const fileTypeUtils_1 = require("../utils/fileTypeUtils");
const ChangeDetector_1 = require("./ChangeDetector");
const LOGGER = new logger_1.default("Discovery.ts");
class Discovery {
    constructor(isFullScan, octaneUrl, sharedSpace, workspace, clientId, clientSecret) {
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
            yield this.getModifiedTestsAndDataTables(discoveredTests, filteredScmResourceFiles);
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
    getModifiedTestsAndDataTables(discoveredTests, discoveredScmResourceFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoID = yield (0, octaneClient_1.getScmRepo)(this.octaneSDKConnection, this.octaneApi);
            let existingTests;
            if (this.isFullScan) {
                existingTests = yield (0, octaneClient_1.getExistingUFTTests)(this.octaneSDKConnection);
            }
            else {
                existingTests = yield (0, octaneClient_1.getExistingTestsInScmRepo)(this.octaneSDKConnection, repoID);
            }
            const existingDataTables = yield (0, octaneClient_1.getScmResourceFilesFromOctane)(this.octaneSDKConnection, this.octaneApi, repoID);
            let changedTests;
            let changedDataTables;
            const modifiedFilesArray = yield this.getModifiedFiles();
            LOGGER.debug("The modified files array is: " + modifiedFilesArray);
            const changedTestsAndScmResourceFiles = yield (0, fileTypeUtils_1.determineFileAndChangeType)(modifiedFilesArray, discoveredTests, existingTests);
            const modifiedTestsMap = changedTestsAndScmResourceFiles.getAllModifiedTests();
            const testsToDelete = changedTestsAndScmResourceFiles.getAllDeletedTests();
            const addedTests = changedTestsAndScmResourceFiles.getAllAddedTests();
            const removedDataTables = changedTestsAndScmResourceFiles.getAllDeletedScmResourceFiles();
            const modifiedDataTables = changedTestsAndScmResourceFiles.getAllModifiedScmResourceFiles();
            const addedDataTables = changedTestsAndScmResourceFiles.getAllAddedScmResourceFiles();
            changedTests = yield (0, ChangeDetector_1.detectTestChanges)(discoveredTests, existingTests, addedTests, modifiedTestsMap, testsToDelete);
            const filteredAddedDataTables = yield (0, utils_1.removeFalsePositiveDataTablesAtUpdate)(discoveredTests, addedDataTables);
            changedDataTables = yield (0, ChangeDetector_1.detectDataTableChanges)(filteredAddedDataTables, removedDataTables, modifiedDataTables, discoveredScmResourceFiles, existingDataTables);
            yield (0, OctaneSyncService_1.sendTestEventsToOctane)(this.octaneSDKConnection, this.octaneApi, changedTests, repoID);
            yield (0, OctaneSyncService_1.sendDataTableEventsToOctane)(this.octaneSDKConnection, this.octaneApi, changedDataTables, repoID);
        });
    }
}
exports.default = Discovery;
