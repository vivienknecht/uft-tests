import AutomatedTest from "../dto/uft/AutomatedTest";
import { ScmResourceFile } from "../dto/uft/ScmResourceFile";
declare const detectTestChanges: (discoveredTests: AutomatedTest[], existingTests: AutomatedTest[], addedTests: AutomatedTest[], modifiedTests: {
    oldValue: AutomatedTest;
    newValue: AutomatedTest;
}[], deletedTests: AutomatedTest[]) => Promise<AutomatedTest[]>;
declare const detectDataTableChanges: (addedDataTables: ScmResourceFile[], deletedDataTables: ScmResourceFile[], modifiedDataTables: {
    oldValue: ScmResourceFile;
    newValue: ScmResourceFile;
}[], discoveredDataTables: ScmResourceFile[], existingDataTables: ScmResourceFile[]) => Promise<ScmResourceFile[]>;
export { detectTestChanges, detectDataTableChanges };
//# sourceMappingURL=ChangeDetector.d.ts.map