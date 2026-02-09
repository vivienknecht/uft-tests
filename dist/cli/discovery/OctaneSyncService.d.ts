import AutomatedTest from "../dto/uft/AutomatedTest";
import { ScmResourceFile } from "../dto/uft/ScmResourceFile";
declare const sendTestEventsToOctane: (octaneSDKConnection: any, octaneApi: string, modifiedTests: AutomatedTest[], repoRootID: string) => Promise<void>;
declare const sendDataTableEventsToOctane: (octaneSDKConnection: any, octaneApi: string, modifiedDataTables: ScmResourceFile[], repoRootID: string) => Promise<void>;
export { sendTestEventsToOctane, sendDataTableEventsToOctane };
//# sourceMappingURL=OctaneSyncService.d.ts.map