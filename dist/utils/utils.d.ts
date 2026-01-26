import { DOMParser } from "@xmldom/xmldom";
import AutomatedTest from "../dto/uft/AutomatedTest";
import { ScmResourceFile } from "../dto/uft/ScmResourceFile";
export type Document = ReturnType<DOMParser["parseFromString"]>;
declare const getGUITestDoc: (pathToTest: string) => Promise<Document | null>;
declare const checkIfFileExists: (pathToTest: string, fileName: string) => Promise<string | null>;
/**
 * Extracts and converts the XML content from a .tsp (or .mtr) file.
 *
 * These files are Compound File Binary (CFB) files that contain various streams, including one named "ComponentInfo" which holds the needed XML data about the test.
 *
 * The function reads the given binary file, finds the ComponentInfo stream, decodes it as UTF-16LE, cleans up null characters, and returns the resulting XML string.
 * @param tspFile - The path to the .tsp (or .mtr) file to be converted.
 * @returns A Promise that resolves to a UTF-8 XML string extracted from the ComponentInfo stream.
 * @throws {Error} - If the file cannot be read, the ComponentInfo stream is missing, or the XML content cannot be found.
 */
declare const convertToXml: (tspFile: string) => Promise<string | null>;
declare const customDOMParser: () => DOMParser;
declare const getDescriptionForGUITest: (doc: Document | null) => (string | null);
declare const convertToHtml: (description: string | null) => (string | null);
declare const getAPITestDoc: (pathToTest: string) => Promise<Document | null>;
declare const getDescriptionForAPITest: (doc: Document | null) => (string | null);
declare const getTestNameAtSync: (pathToTest: string) => string;
declare const getClassNameAtSync: (pathToTest: string) => string;
declare const getPackageNameAtSync: (className: string) => string;
declare const removeFalsePositiveDataTables: (tests: AutomatedTest[], scmResourceFiles: ScmResourceFile[]) => Promise<ScmResourceFile[]>;
declare const removeFalsePositiveDataTablesAtUpdate: (tests: AutomatedTest[], scmResourceFiles: ScmResourceFile[]) => Promise<ScmResourceFile[]>;
declare const verifyPath: (pathToRepo: string) => Promise<boolean>;
export { getGUITestDoc, getDescriptionForGUITest, convertToHtml, checkIfFileExists, convertToXml, customDOMParser, getAPITestDoc, getDescriptionForAPITest, getTestNameAtSync, getClassNameAtSync, getPackageNameAtSync, removeFalsePositiveDataTables, removeFalsePositiveDataTablesAtUpdate, verifyPath };
//# sourceMappingURL=utils.d.ts.map