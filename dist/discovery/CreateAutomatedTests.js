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
exports.createAutomatedTestFromAPI = exports.createAutomatedTestsFromGUI = void 0;
const path = require("node:path");
const utils_1 = require("../utils/utils");
const ROOT_TESTS_DIR = process.env.BUILD_SOURCESDIRECTORY || process.env.GITHUB_WORKSPACE || process.env.CI_PROJECT_DIR || "";
const createAutomatedTestsFromGUI = (pathToTest, testType) => __awaiter(void 0, void 0, void 0, function* () {
    const test = yield createTest(pathToTest, testType);
    const document = yield (0, utils_1.getGUITestDoc)(pathToTest);
    let description;
    description = (0, utils_1.getDescriptionForGUITest)(document);
    description = (0, utils_1.convertToHtml)(description);
    test.description = description || "";
    return test;
});
exports.createAutomatedTestsFromGUI = createAutomatedTestsFromGUI;
const createAutomatedTestFromAPI = (pathToTest, testType) => __awaiter(void 0, void 0, void 0, function* () {
    const test = yield createTest(pathToTest, testType);
    const documentForApiTest = yield (0, utils_1.getAPITestDoc)(pathToTest);
    let description = (0, utils_1.getDescriptionForAPITest)(documentForApiTest);
    description = (0, utils_1.convertToHtml)(description);
    test.description = description || "";
    return test;
});
exports.createAutomatedTestFromAPI = createAutomatedTestFromAPI;
const createTest = (pathToTest, testType) => __awaiter(void 0, void 0, void 0, function* () {
    const testName = path.basename(pathToTest);
    const className = getClassName(pathToTest);
    const packageName = getPackageName(className);
    const test = {
        name: testName,
        packageName: packageName,
        className: className,
        uftOneTestType: testType,
        isExecutable: true,
    };
    return test;
});
const getClassName = (pathToTest) => {
    let className;
    className = path.relative(ROOT_TESTS_DIR, pathToTest);
    const parts = className.split(path.sep);
    className = parts.join("/");
    return className;
};
const getPackageName = (className) => {
    let packageName;
    const parts = className.split("/");
    parts.pop();
    packageName = parts.join("/");
    return packageName;
};
