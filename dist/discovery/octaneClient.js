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
exports.getScmResourceFilesFromOctane = exports.deleteScmResourceFile = exports.updateScmResourceFile = exports.createScmResourceFile = exports.makeTestNotExecutableInOctane = exports.sendUpdateTestEventToOctane = exports.sendCreateTestEventToOctane = exports.getExistingUFTTests = exports.getExistingTestsInScmRepo = exports.getScmRepo = exports.getTestRunnerId = void 0;
const alm_octane_js_rest_sdk_1 = require("@microfocus/alm-octane-js-rest-sdk");
const logger_1 = require("../utils/logger");
const LOGGER = new logger_1.default("octaneClient.ts");
const getTestRunnerId = (octaneConnection, octaneApi) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipelineName = process.env.BUILD_DEFINITIONNAME;
        const testRunner = yield octaneConnection.executeCustomRequest(`${octaneApi}/executors?query=\"ci_job EQ {name EQ ^${pipelineName}*^}\"`, alm_octane_js_rest_sdk_1.Octane.operationTypes.get);
        return testRunner.data[0].id;
    }
    catch (error) {
        LOGGER.error("Error occurred while getting test runner id from Octane: " + error.message);
        return "";
    }
});
exports.getTestRunnerId = getTestRunnerId;
const getScmRepo = (octaneConnection, octaneApi) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repoUrl = process.env.REPOURL || "";
        const scmRepos = yield octaneConnection.executeCustomRequest(`${octaneApi}/scm_repositories/?query=\"repository EQ {url EQ ^${repoUrl}^}\"`, alm_octane_js_rest_sdk_1.Octane.operationTypes.get);
        LOGGER.info("The scm repository roots are: " + JSON.stringify(scmRepos));
        return scmRepos.data[0].id;
    }
    catch (error) {
        LOGGER.error("Error occurred while getting scm repository from Octane: " + error.message);
        return "";
    }
});
exports.getScmRepo = getScmRepo;
const getExistingTestsInScmRepo = (octaneConnection, scmRepositoryId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingTests = yield octaneConnection.get(alm_octane_js_rest_sdk_1.Octane.entityTypes.tests).fields('id', 'executable', 'name', 'package', 'class_name', 'description')
            .query(alm_octane_js_rest_sdk_1.Query.field('scm_repository').equal(alm_octane_js_rest_sdk_1.Query.field('id').equal(scmRepositoryId))
            .and(alm_octane_js_rest_sdk_1.Query.field('testing_tool_type').equal(alm_octane_js_rest_sdk_1.Query.field('id').equal('list_node.testing_tool_type.uft'))).build())
            .execute();
        const automatedTests = [];
        for (const testData of existingTests.data) {
            const automatedTest = {
                id: testData.id,
                name: testData.name,
                packageName: testData.package,
                className: testData.class_name,
                description: testData.description,
                isExecutable: testData.executable
            };
            automatedTests.push(automatedTest);
        }
        return automatedTests;
    }
    catch (error) {
        LOGGER.error("Error occurred while getting existing tests in scm repository from Octane: " + error.message);
        return [];
    }
});
exports.getExistingTestsInScmRepo = getExistingTestsInScmRepo;
const getExistingUFTTests = (octaneConnection) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUftTests = yield octaneConnection.get(alm_octane_js_rest_sdk_1.Octane.entityTypes.tests).fields('id', 'executable', 'name', 'package', 'class_name', 'description')
            .query(alm_octane_js_rest_sdk_1.Query.field('testing_tool_type').equal(alm_octane_js_rest_sdk_1.Query.field('id').equal('list_node.testing_tool_type.uft')).build()).execute();
        const automatedTests = [];
        for (const testData of existingUftTests.data) {
            const automatedTest = {
                id: testData.id,
                name: testData.name,
                packageName: testData.package,
                className: testData.class_name,
                description: testData.description,
                isExecutable: testData.executable
            };
            automatedTests.push(automatedTest);
        }
        return automatedTests;
    }
    catch (error) {
        LOGGER.error("Error occurred while getting existing UFT tests from Octane: " + error.message);
        return [];
    }
});
exports.getExistingUFTTests = getExistingUFTTests;
const sendCreateTestEventToOctane = (octaneConnection, octaneApi, name, packageName, className, description, scmRepositoryId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = {
            testing_tool_type: {
                type: "list_node",
                id: "list_node.testing_tool_type.uft"
            },
            subtype: "test_automated",
            name: name,
            package: packageName,
            class_name: className,
            description: description,
            scm_repository: {
                type: "scm_repository",
                id: scmRepositoryId
            },
            executable: true,
            test_runner: {
                type: "executor",
                id: yield getTestRunnerId(octaneConnection, octaneApi)
            }
        };
        yield octaneConnection.create(alm_octane_js_rest_sdk_1.Octane.entityTypes.tests, body).execute();
    }
    catch (error) {
        LOGGER.error("Error occurred while sending create test event to Octane: " + error.message);
    }
});
exports.sendCreateTestEventToOctane = sendCreateTestEventToOctane;
const sendUpdateTestEventToOctane = (octaneConnection, testId, name, packageName, description, className, isExecutable) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = {
            "data": [
                {
                    "subtype": "test_automated",
                    "id": testId,
                    "name": name,
                    "package": packageName,
                    "description": description,
                    "class_name": className,
                    "executable": isExecutable
                }
            ]
        };
        yield octaneConnection.update(alm_octane_js_rest_sdk_1.Octane.entityTypes.tests, body).execute();
    }
    catch (error) {
        LOGGER.error("Error occurred while sending update test event to Octane: " + error.message);
    }
});
exports.sendUpdateTestEventToOctane = sendUpdateTestEventToOctane;
const makeTestNotExecutableInOctane = (octaneConnection, testId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = {
            "data": [
                {
                    "id": testId,
                    "executable": false
                }
            ]
        };
        yield octaneConnection.update(alm_octane_js_rest_sdk_1.Octane.entityTypes.tests, body).execute();
    }
    catch (error) {
        LOGGER.error("Error occurred while making test not executable in Octane: " + error.message);
    }
});
exports.makeTestNotExecutableInOctane = makeTestNotExecutableInOctane;
const createScmResourceFile = (octaneConnection, octaneApi, name, relativePath, scmRepoId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = {
            "data": [
                {
                    "name": name,
                    "relative_path": relativePath,
                    "scm_repository": {
                        "type": "scm_repository",
                        "id": scmRepoId
                    }
                }
            ]
        };
        yield octaneConnection.executeCustomRequest(`${octaneApi}/scm_resource_files`, alm_octane_js_rest_sdk_1.Octane.operationTypes.create, body);
    }
    catch (error) {
        LOGGER.error("Error occurred while creating scm resource file in Octane: " + error.message);
    }
});
exports.createScmResourceFile = createScmResourceFile;
const updateScmResourceFile = (octaneConnection, octaneApi, scmResourceFileId, name, relativePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = {
            "data": [
                {
                    "id": scmResourceFileId,
                    "name": name,
                    "relative_path": relativePath
                }
            ]
        };
        yield octaneConnection.executeCustomRequest(`${octaneApi}/scm_resource_files`, alm_octane_js_rest_sdk_1.Octane.operationTypes.update, body);
    }
    catch (error) {
        LOGGER.error("Error occurred while updating scm resource file in Octane: " + error.message);
    }
});
exports.updateScmResourceFile = updateScmResourceFile;
const deleteScmResourceFile = (octaneConnection, octaneApi, scmResourceFileId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield octaneConnection.executeCustomRequest(`${octaneApi}/scm_resource_files/?query=\"(id=^${scmResourceFileId}^)\"`, alm_octane_js_rest_sdk_1.Octane.operationTypes.delete);
    }
    catch (error) {
        LOGGER.error("Error occurred while deleting scm resource file in Octane: " + error.message);
    }
});
exports.deleteScmResourceFile = deleteScmResourceFile;
const getScmResourceFilesFromOctane = (octaneConnection, octaneApi, repoId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resourceFiles = [];
        const allResourceFiles = yield octaneConnection.executeCustomRequest(`${octaneApi}/scm_resource_files?/?query=\"scm_repository EQ {id EQ ^${repoId}^}\"&fields=name,relative_path,scm_repository`, alm_octane_js_rest_sdk_1.Octane.operationTypes.get);
        for (const fileData of allResourceFiles.data) {
            const scmResourceFile = {
                id: fileData.id,
                name: fileData.name,
                relativePath: fileData.relative_path,
                scmRepositoryId: fileData.scm_repository.id
            };
            resourceFiles.push(scmResourceFile);
        }
        return resourceFiles;
    }
    catch (error) {
        LOGGER.error("Error occurred while getting scm resource files from Octane: " + error.message);
        return [];
    }
});
exports.getScmResourceFilesFromOctane = getScmResourceFilesFromOctane;
