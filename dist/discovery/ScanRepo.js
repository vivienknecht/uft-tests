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
const path = require("path");
const fs = require("fs");
const logger_1 = require("../utils/logger");
const DiscoveryResults_1 = require("./DiscoveryResults");
const CreateAutomatedTests_1 = require("./CreateAutomatedTests");
const LOGGER = new logger_1.default("ScanRepo.ts");
const UFT_GUI_TEST_EXTENSION = ".tsp";
const UFT_API_TEST_EXTENSION = ".st";
const UFT_GUI_TEST_TYPE = "GUI";
const UFT_API_TEST_TYPE = "API";
const NOT_UFT_TEST_TYPE = "Unknown test type";
const XLSX = ".xlsx";
const XLS = ".xls";
class ScanRepo {
    constructor(workDir) {
        this.workDir = "";
        this.tests = [];
        this.scmResourceFiles = [];
        this.workDir = workDir;
    }
    scanRepo(pathToRepo) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield fs.promises.readdir(pathToRepo);
            let testType;
            let dataTableNames;
            try {
                dataTableNames = yield this.isDataTable(items);
                if (dataTableNames) {
                    const dataTable = yield this.createScmResourceFile(dataTableNames, pathToRepo);
                    this.scmResourceFiles.push(...dataTable);
                }
                testType = yield this.getTestType(items);
                if (testType === UFT_GUI_TEST_TYPE) {
                    const automatedTests = yield (0, CreateAutomatedTests_1.createAutomatedTestsFromGUI)(pathToRepo, testType);
                    this.tests.push(automatedTests);
                }
                else if (testType === UFT_API_TEST_TYPE) {
                    const foundApiTests = yield (0, CreateAutomatedTests_1.createAutomatedTestFromAPI)(pathToRepo, testType);
                    this.tests.push(foundApiTests);
                }
                else {
                    for (const item of items) {
                        const itemPath = path.join(pathToRepo, item);
                        LOGGER.info("Scanning item: " + itemPath);
                        const stats = yield fs.promises.lstat(itemPath);
                        if (stats.isDirectory() || stats.isSymbolicLink()) {
                            if (stats.isSymbolicLink()) {
                                LOGGER.warn(`${itemPath} is a symlink and symlinks are not supported and will be ignored.`);
                                continue;
                            }
                            yield this.scanRepo(itemPath);
                        }
                    }
                }
            }
            catch (e) {
                throw new Error("Error while scanning the repo: " + e.message);
            }
            return new DiscoveryResults_1.default(this.tests, this.scmResourceFiles);
        });
    }
    getTestType(paths) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const p of paths) {
                const ext = path.extname(p).toLowerCase();
                if (ext === UFT_GUI_TEST_EXTENSION) {
                    return UFT_GUI_TEST_TYPE;
                }
                else if (ext === UFT_API_TEST_EXTENSION) {
                    return UFT_API_TEST_TYPE;
                }
            }
            return NOT_UFT_TEST_TYPE;
        });
    }
    isDataTable(paths) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundDataTables = [];
            for (const p of paths) {
                const ext = path.extname(p).toLowerCase();
                if (ext === XLSX || ext === XLS) {
                    foundDataTables.push(p);
                }
            }
            return foundDataTables;
        });
    }
    createScmResourceFile(dataTableNames, pathToDataTable) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataTables = [];
            let relativePath = path.relative(this.workDir, pathToDataTable).replace(/\\/g, '/');
            if (relativePath) {
                relativePath = relativePath + '/';
            }
            for (const dataTableName of dataTableNames) {
                const dataTable = {
                    name: dataTableName,
                    relativePath: relativePath + dataTableName,
                };
                dataTables.push(dataTable);
            }
            return dataTables;
        });
    }
}
exports.default = ScanRepo;
