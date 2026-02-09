import AutomatedTest from "../dto/uft/AutomatedTest";
import { ScmResourceFile } from "../dto/uft/ScmResourceFile";
export default class DiscoveryResults {
    private readonly _tests;
    private readonly _scmResourceFiles;
    constructor(tests: AutomatedTest[], scmResourceFiles: ScmResourceFile[]);
    getAllTests(): AutomatedTest[];
    getAllScmResourceFiles(): ScmResourceFile[];
}
//# sourceMappingURL=DiscoveryResults.d.ts.map