export default class Logger {
    private module;
    private readonly levels;
    constructor(module: string);
    trace(message: string): void;
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    /**
     * Log a message at a certain logging level.
     *
     * @param logLevel Level to log at
     * @param message Message to log
     */
    private log;
    /**
     * Converts a string level (trace/debug/info/warn/error) into a number and display value
     *
     * @param minLevel
     */
    private getLevel;
    /**
     * Emits a log message.
     *
     * @param logLevelPrefix Display name of the log level
     * @param message Message to log
     */
    private emit;
}
//# sourceMappingURL=logger.d.ts.map