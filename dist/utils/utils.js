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
exports.verifyPath = exports.removeFalsePositiveDataTablesAtUpdate = exports.removeFalsePositiveDataTables = exports.getPackageNameAtSync = exports.getClassNameAtSync = exports.getTestNameAtSync = exports.getDescriptionForAPITest = exports.getAPITestDoc = exports.customDOMParser = exports.convertToXml = exports.checkIfFileExists = exports.convertToHtml = exports.getDescriptionForGUITest = exports.getGUITestDoc = void 0;
const path = require("path");
const fs = require("fs/promises");
const fs1 = require("fs");
const logger_1 = require("./logger");
const CFB = require("cfb");
const xmldom_1 = require("@xmldom/xmldom");
const LOGGER = new logger_1.default("utils.ts");
const UFT_GUI_TEST_FILE = 'Test.tsp';
const COMPONENT_INFO = "ComponentInfo";
const TEXT_XML = "text/xml";
const ACTIONS_XML = 'actions.xml';
const getGUITestDoc = (pathToTest) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tspTestFile = yield checkIfFileExists(pathToTest, UFT_GUI_TEST_FILE);
        if (!tspTestFile) {
            LOGGER.error(`The is no ${UFT_GUI_TEST_FILE} in the ${pathToTest}`);
            return null;
        }
        const xmlFormat = yield convertToXml(tspTestFile);
        if (!xmlFormat) {
            LOGGER.warn("No valid XML content could be extracted from the TSP file.");
            return null;
        }
        const parser = customDOMParser();
        const doc = parser.parseFromString(xmlFormat, TEXT_XML);
        if (!doc.documentElement) {
            LOGGER.error("No document element found in the parsed XML.");
            return null;
        }
        return doc;
    }
    catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        LOGGER.error("Failed to get GUI test document. " + errorMessage);
        return null;
    }
});
exports.getGUITestDoc = getGUITestDoc;
const checkIfFileExists = (pathToTest, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = path.join(pathToTest, fileName);
    try {
        yield fs.access(filePath);
        return filePath;
    }
    catch (e) {
        LOGGER.warn(`There is no file name ${fileName} in the path ${pathToTest}`);
        return null;
    }
});
exports.checkIfFileExists = checkIfFileExists;
/**
 * Extracts and converts the XML content from a .tsp (or .mtr) file.
 *
 * These files are Compound File Binary (CFB) files that contain various streams, including one named "ComponentInfo" which holds the needed XML data about the test.
 *
 * The function reads the given binary file, finds the ComponentInfo stream, decodes it as UTF-16LE, cleans up null characters, and returns the resulting XML string.
 * @param tspFile - The path to the .tsp (or .mtr) file to be converted.
 * @returns A Promise that resolves to a UTF-8 XML string extracted from the ComponentInfo stream.
 * @throws {Error} - If the file cannot be read, the ComponentInfo stream is missing, or the XML content cannot be found.
 */
const convertToXml = (tspFile) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield fs.readFile(tspFile);
        const cfb = CFB.read(data, { type: 'buffer' });
        const stream = CFB.find(cfb, COMPONENT_INFO);
        if (!stream) {
            LOGGER.error("ComponentInfo stream not found in the TSP file.");
            throw new Error("ComponentInfo stream not found in the TSP file.");
        }
        const content = Buffer.isBuffer(stream.content)
            ? stream.content
            : Buffer.from(stream.content);
        const unicodeFormat = bufferToUnicode16LE(content);
        const xmlStart = unicodeFormat.indexOf("<");
        if (xmlStart >= 0) {
            return unicodeFormat.substring(xmlStart).replace(/\0/g, "");
        }
        else {
            LOGGER.error("XML content not found in ComponentInfo stream.");
            throw new Error("XML content not found in ComponentInfo stream.");
        }
    }
    catch (e) {
        LOGGER.error("Failed to convert TSP to XML format." + e.message);
        return null;
    }
});
exports.convertToXml = convertToXml;
const bufferToUnicode16LE = (buffer) => {
    let result = '';
    for (let i = 0; i < buffer.length; i += 2) {
        const codeUnit = buffer.readUInt16LE(i);
        if (codeUnit === 0)
            continue; // Skip null characters
        result += String.fromCharCode(codeUnit);
    }
    return result;
};
const customDOMParser = () => {
    return new xmldom_1.DOMParser({
        errorHandler: (level, msg) => {
            if (level === 'error') {
                LOGGER.error("XML Parsing Error: " + msg);
            }
            else if (level === "fatalError") {
                LOGGER.error("XML Fatal Parsing Error: " + msg);
                throw new Error("Fatal XML Parsing Error: " + msg);
            }
            return null;
        }
    });
};
exports.customDOMParser = customDOMParser;
const getDescriptionForGUITest = (doc) => {
    var _a;
    if (!doc) {
        LOGGER.warn("No document provided for extracting GUI test description.");
        return null;
    }
    let description;
    description = ((_a = doc.getElementsByTagName("Description").item(0)) === null || _a === void 0 ? void 0 : _a.textContent) || "";
    return description.trim();
};
exports.getDescriptionForGUITest = getDescriptionForGUITest;
const convertToHtml = (description) => {
    if (description == null || !description.includes("\n"))
        return description;
    const paragraphs = description
        .split("\n")
        .map(line => `<p>${line}</p>`)
        .join("");
    return `<html><body>${paragraphs}</body></html>`;
};
exports.convertToHtml = convertToHtml;
const getAPITestDoc = (pathToTest) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actionsXmlFile = yield checkIfFileExists(pathToTest, ACTIONS_XML);
        if (!actionsXmlFile) {
            LOGGER.warn("There is no actions.xml file in the API test folder.");
            return null;
        }
        const xmlContent = yield fs.readFile(actionsXmlFile, 'utf8');
        const parser = customDOMParser();
        const xml = xmlContent.replace(/^\uFEFF/, "");
        const doc = parser.parseFromString(xml, TEXT_XML);
        if (!doc.documentElement) {
            LOGGER.error("No document element found in the parsed XML.");
            throw new Error("No document element found in the parsed XML.");
        }
        return doc;
    }
    catch (e) {
        LOGGER.error("Failed to get API test document. " + e.message);
        return null;
    }
});
exports.getAPITestDoc = getAPITestDoc;
const getDescriptionForAPITest = (doc) => {
    let description;
    if (!doc) {
        LOGGER.warn("No document provided for extracting API test description.");
        return null;
    }
    const actions = doc.getElementsByTagName("Action");
    for (let i = 0; i < actions.length; i++) {
        const action = actions.item(i);
        if (action) {
            const attributes = action.attributes;
            const internalNameAttr = attributes.getNamedItem("internalName");
            if (internalNameAttr && internalNameAttr.nodeValue === "MainAction") {
                const descriptionAttribute = attributes.getNamedItem("description");
                if (descriptionAttribute) {
                    description = descriptionAttribute.nodeValue;
                    if (description != null) {
                        return description.trim();
                    }
                }
            }
        }
    }
    return null;
};
exports.getDescriptionForAPITest = getDescriptionForAPITest;
const getTestNameAtSync = (pathToTest) => {
    return path.basename(path.dirname(pathToTest));
};
exports.getTestNameAtSync = getTestNameAtSync;
const getClassNameAtSync = (pathToTest) => {
    return path.dirname(pathToTest);
};
exports.getClassNameAtSync = getClassNameAtSync;
const getPackageNameAtSync = (className) => {
    return path.dirname(className) === '.' ? '' : path.dirname(className);
};
exports.getPackageNameAtSync = getPackageNameAtSync;
const removeFalsePositiveDataTables = (tests, scmResourceFiles) => __awaiter(void 0, void 0, void 0, function* () {
    const classNames = new Set(tests.map(t => t.className));
    scmResourceFiles = scmResourceFiles.filter(file => {
        const relativeDir = path.dirname(file.relativePath);
        return !classNames.has(relativeDir);
    });
    LOGGER.debug("The filtered data tables are: " + JSON.stringify(scmResourceFiles));
    return scmResourceFiles;
});
exports.removeFalsePositiveDataTables = removeFalsePositiveDataTables;
const removeFalsePositiveDataTablesAtUpdate = (tests, scmResourceFiles) => __awaiter(void 0, void 0, void 0, function* () {
    const classNames = new Set(tests.map(t => t.className));
    scmResourceFiles = scmResourceFiles.filter(file => {
        const relativeDir = path.dirname(file.relativePath);
        if (classNames.has(relativeDir)) {
            return false;
        }
        const startsWithClasName = [...classNames].some(className => relativeDir.startsWith(className));
        return !startsWithClasName;
    });
    LOGGER.debug("The filtered data tables are: " + JSON.stringify(scmResourceFiles));
    return scmResourceFiles;
});
exports.removeFalsePositiveDataTablesAtUpdate = removeFalsePositiveDataTablesAtUpdate;
const verifyPath = (pathToRepo) => __awaiter(void 0, void 0, void 0, function* () {
    if (!pathToRepo || pathToRepo.length > 4096) {
        throw new Error("The provided path is either empty or exceeds the maximum length of 4096 characters.");
    }
    const controlChars = /[\u0000-\u001F\u007F]/;
    if (controlChars.test(pathToRepo)) {
        throw new Error("The provided path contains invalid control characters.");
    }
    const resolvedPath = path.resolve(pathToRepo);
    const allowedRoot = path.resolve(process.env.BUILD_SOURCESDIRECTORY);
    if (!resolvedPath.startsWith(allowedRoot)) {
        throw new Error('Path escapes the repository root');
    }
    let stats;
    try {
        stats = fs1.statSync(resolvedPath);
    }
    catch (err) {
        throw new Error('The provided path does not exist');
    }
    if (!stats.isDirectory()) {
        throw new Error('The provided path is not a directory');
    }
    const realPath = fs1.realpathSync(resolvedPath);
    if (!realPath.startsWith(allowedRoot)) {
        throw new Error('Path escapes the repository root via symlink');
    }
    if (realPath === path.parse(realPath).root) {
        throw new Error('The provided path is the root directory, which is not allowed');
    }
    return true;
});
exports.verifyPath = verifyPath;
