import CustomFramework from "./dto/CustomFramework";
/**
 * Parses a JSON string for custom test framework configuration, extracting settings for
 * test formatting, delimiters, optional prefixes/suffixes, and transformation rules.
 *
 * @param configString - JSON string representing framework configuration.
 * @returns `CustomFrameworkConfig` - Parsed configuration object.
 * @throws `Error` - If JSON parsing fails or required fields are missing.
 */
declare const parseCustomFramework: (configString: string) => CustomFramework;
export default parseCustomFramework;
//# sourceMappingURL=customFrameworkParser.d.ts.map