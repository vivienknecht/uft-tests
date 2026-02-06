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
exports.sendDataTableEventsToOctane = exports.sendTestEventsToOctane = void 0;
const octaneClient_1 = require("./octaneClient");
const logger_1 = require("../utils/logger");
const LOGGER = new logger_1.default("OctaneSyncService.ts");
const sendTestEventsToOctane = (octaneSDKConnection, octaneApi, modifiedTests, repoRootID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (const test of modifiedTests) {
            LOGGER.debug("the change type of test " + test.name + " is: " + test.changeType);
            if (test.changeType === "deleted") {
                if (test.id) {
                    yield (0, octaneClient_1.makeTestNotExecutableInOctane)(octaneSDKConnection, test.id);
                }
            }
            else if (test.changeType === "modified") {
                if (test.id) {
                    yield (0, octaneClient_1.sendUpdateTestEventToOctane)(octaneSDKConnection, test.id, test.name, test.packageName, test.description, test.className, test.isExecutable);
                }
            }
            else if (test.changeType === "added") {
                yield (0, octaneClient_1.sendCreateTestEventToOctane)(octaneSDKConnection, octaneApi, test.name, test.packageName, test.className, test.description, repoRootID);
            }
        }
    }
    catch (e) {
        LOGGER.error("Failed to send test events to Octane. " + e.message);
        throw new Error("Failed to send test events to Octane. " + e.message);
    }
});
exports.sendTestEventsToOctane = sendTestEventsToOctane;
const sendDataTableEventsToOctane = (octaneSDKConnection, octaneApi, modifiedDataTables, repoRootID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (const dataTable of modifiedDataTables) {
            LOGGER.debug("The change type of data table " +
                dataTable.name +
                " is: " +
                dataTable.changeType);
            if (dataTable.changeType === "added") {
                yield (0, octaneClient_1.createScmResourceFile)(octaneSDKConnection, octaneApi, dataTable.name, dataTable.relativePath, repoRootID);
            }
            else if (dataTable.changeType === "modified") {
                if (dataTable.id) {
                    yield (0, octaneClient_1.updateScmResourceFile)(octaneSDKConnection, octaneApi, dataTable.id, dataTable.name, dataTable.relativePath);
                }
            }
            else if (dataTable.changeType === "deleted") {
                if (dataTable.id) {
                    yield (0, octaneClient_1.deleteScmResourceFile)(octaneSDKConnection, octaneApi, dataTable.id);
                }
            }
        }
    }
    catch (e) {
        LOGGER.error("Failed to send scm resource files events to Octane. " +
            e.message);
        throw new Error("Failed to scm resource files test events to Octane. " +
            e.message);
    }
});
exports.sendDataTableEventsToOctane = sendDataTableEventsToOctane;
