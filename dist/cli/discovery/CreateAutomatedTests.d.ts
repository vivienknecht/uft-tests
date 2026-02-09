import AutomatedTest from "../dto/uft/AutomatedTest";
declare const createAutomatedTestsFromGUI: (pathToTest: string, testType: string) => Promise<AutomatedTest>;
declare const createAutomatedTestFromAPI: (pathToTest: string, testType: string) => Promise<AutomatedTest>;
export { createAutomatedTestsFromGUI, createAutomatedTestFromAPI };
//# sourceMappingURL=CreateAutomatedTests.d.ts.map