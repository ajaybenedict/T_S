export class ProductDetailsRequest {
    Offset: number | undefined;
    MaxResult: number | undefined;
    SortBy?: string;
    SortOrder?: string;
    SearchText?: string;
    VendorKey?: string;
    CountryNames?: string;
    SearchFor: number | undefined;
    ERPCode?: string
}