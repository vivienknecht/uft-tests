import DiscoveryResults from "./DiscoveryResults";
export default class ScanRepo {
    private readonly workDir;
    private tests;
    private scmResourceFiles;
    constructor(workDir: string);
    scanRepo(pathToRepo: string): Promise<DiscoveryResults>;
    private getTestType;
    private isDataTable;
    private createScmResourceFile;
}
//# sourceMappingURL=ScanRepo.d.ts.map