import UftTestParameter from "./UftTestParameter";
import ExternalDataTable from "./ExternalDataTable";
export default interface ConvertedUftTest {
    _attributes: {
        name: string;
        path: string;
    };
    parameter: UftTestParameter[];
    DataTable?: ExternalDataTable;
}
//# sourceMappingURL=ConvertedUftTests.d.ts.map