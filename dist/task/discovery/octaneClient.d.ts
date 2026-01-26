import { ScmResourceFile } from "../dto/uft/ScmResourceFile";
import AutomatedTest from "../dto/uft/AutomatedTest";
declare const getTestRunnerId: (octaneConnection: any, octaneApi: string) => Promise<string>;
declare const getScmRepo: (octaneConnection: any, octaneApi: string) => Promise<string>;
declare const getExistingTestsInScmRepo: (octaneConnection: any, scmRepositoryId: string) => Promise<AutomatedTest[]>;
declare const getExistingUFTTests: (octaneConnection: any) => Promise<AutomatedTest[]>;
declare const sendCreateTestEventToOctane: (octaneConnection: any, octaneApi: string, name: string, packageName: string, className: string, description: string | undefined, scmRepositoryId: string) => Promise<void>;
declare const sendUpdateTestEventToOctane: (octaneConnection: any, testId: string, name: string, packageName: string, description: string | undefined, className: string, isExecutable: boolean | undefined) => Promise<void>;
declare const makeTestNotExecutableInOctane: (octaneConnection: any, testId: string) => Promise<void>;
declare const createScmResourceFile: (octaneConnection: any, octaneApi: string, name: string, relativePath: string, scmRepoId: string) => Promise<void>;
declare const updateScmResourceFile: (octaneConnection: any, octaneApi: string, scmResourceFileId: string, name: string, relativePath: string) => Promise<void>;
declare const deleteScmResourceFile: (octaneConnection: any, octaneApi: string, scmResourceFileId: string) => Promise<void>;
declare const getScmResourceFilesFromOctane: (octaneConnection: any, octaneApi: string, repoId: string) => Promise<ScmResourceFile[]>;
export { getTestRunnerId, getScmRepo, getExistingTestsInScmRepo, getExistingUFTTests, sendCreateTestEventToOctane, sendUpdateTestEventToOctane, makeTestNotExecutableInOctane, createScmResourceFile, updateScmResourceFile, deleteScmResourceFile, getScmResourceFilesFromOctane };
//# sourceMappingURL=octaneClient.d.ts.map