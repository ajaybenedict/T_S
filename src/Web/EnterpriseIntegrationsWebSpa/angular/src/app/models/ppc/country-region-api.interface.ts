export interface CountryRegionResponse {
    regionId: number;
    regionName: string;
    countries: Country[];
}

export interface Country {
    id: number;
    countryKey: string;
    name: string;
    erpCountryKey: string;
    erpId: string;
}