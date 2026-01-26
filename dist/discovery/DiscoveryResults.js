"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DiscoveryResults {
    constructor(tests, scmResourceFiles) {
        this._tests = tests;
        this._scmResourceFiles = scmResourceFiles;
    }
    getAllTests() {
        return this._tests;
    }
    getAllScmResourceFiles() {
        return this._scmResourceFiles;
    }
}
exports.default = DiscoveryResults;
