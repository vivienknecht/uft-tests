"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTests = void 0;
const testsToRunParser_1 = require("./testsToRunParser");
const testsToRunConverter_1 = require("./testsToRunConverter");
const logger_1 = require("./utils/logger");
const LOGGER = new logger_1.default("index.ts");
const convertTests = (testsToRun, framework, rootDirectory, customFramework) => {
    LOGGER.warn("USING CONVERT TESTS NEW");
    const parsedTestsToRun = (0, testsToRunParser_1.default)(testsToRun);
    if (testsToRunParser_1.default.length === 0) {
        LOGGER.error("No tests to run have been found.");
        return;
    }
    const convertedTests = (0, testsToRunConverter_1.default)(parsedTestsToRun, framework, rootDirectory, customFramework);
    console.log("The converted tests ", convertedTests);
    return convertedTests;
};
exports.convertTests = convertTests;
