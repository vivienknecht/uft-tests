"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SyncResults {
    constructor(addedTests, addedScmResourceFiles, modifiedTests, modifiedScmResourceFiles, deletedTests, deletedScmResourceFiles) {
        this._addedTests = addedTests;
        this._addedScmResourceFiles = addedScmResourceFiles;
        this._modifiedTests = modifiedTests;
        this._modifiedScmResourceFiles = modifiedScmResourceFiles;
        this._deletedTests = deletedTests;
        this._deletedScmResourceFiles = deletedScmResourceFiles;
    }
    getAllAddedTests() {
        return this._addedTests;
    }
    getAllModifiedTests() {
        return this._modifiedTests;
    }
    getAllDeletedTests() {
        return this._deletedTests;
    }
    getAllAddedScmResourceFiles() {
        return this._addedScmResourceFiles;
    }
    getAllModifiedScmResourceFiles() {
        return this._modifiedScmResourceFiles;
    }
    getAllDeletedScmResourceFiles() {
        return this._deletedScmResourceFiles;
    }
}
exports.default = SyncResults;
