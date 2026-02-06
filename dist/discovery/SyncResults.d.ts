import AutomatedTest from "../dto/uft/AutomatedTest";
import { ScmResourceFile } from "../dto/uft/ScmResourceFile";
export default class SyncResults {
    private readonly _addedTests;
    private readonly _addedScmResourceFiles;
    private readonly _modifiedTests;
    private readonly _modifiedScmResourceFiles;
    private readonly _deletedTests;
    private readonly _deletedScmResourceFiles;
    constructor(addedTests: AutomatedTest[], addedScmResourceFiles: ScmResourceFile[], modifiedTests: {
        oldValue: AutomatedTest;
        newValue: AutomatedTest;
    }[], modifiedScmResourceFiles: {
        oldValue: ScmResourceFile;
        newValue: ScmResourceFile;
    }[], deletedTests: AutomatedTest[], deletedScmResourceFiles: ScmResourceFile[]);
    getAllAddedTests(): AutomatedTest[];
    getAllModifiedTests(): {
        oldValue: AutomatedTest;
        newValue: AutomatedTest;
    }[];
    getAllDeletedTests(): AutomatedTest[];
    getAllAddedScmResourceFiles(): ScmResourceFile[];
    getAllModifiedScmResourceFiles(): {
        oldValue: ScmResourceFile;
        newValue: ScmResourceFile;
    }[];
    getAllDeletedScmResourceFiles(): ScmResourceFile[];
}
//# sourceMappingURL=SyncResults.d.ts.map