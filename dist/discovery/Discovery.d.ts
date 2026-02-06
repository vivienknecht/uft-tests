export default class Discovery {
    private readonly isFullScan;
    private readonly octaneUrl;
    private readonly sharedSpace;
    private readonly workspace;
    private readonly clientId;
    private readonly clientSecret;
    private octaneSDKConnection;
    private readonly octaneApi;
    constructor(isFullScan: boolean, octaneUrl: string, sharedSpace: string, workspace: string, clientId: string, clientSecret: string);
    private initializeOctaneConnection;
    startDiscovery(path: string): Promise<void>;
    private getModifiedFiles;
    private getModifiedTestsAndDataTables;
}
//# sourceMappingURL=Discovery.d.ts.map