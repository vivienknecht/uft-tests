import Arguments from "../utils/arguments";
interface Config {
    framework: string;
    logLevel: number;
    customFramework?: string;
}
declare const initConfig: (args: Arguments) => void;
declare const getConfig: () => Config;
export { initConfig, getConfig };
//# sourceMappingURL=config.d.ts.map