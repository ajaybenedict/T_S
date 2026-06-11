export class Helper {
    static getUrlQueryParam(key: string, url: string | null = null) {
        url = url ?? window.location.href;
        const results = new RegExp('[?&]' + key + '=([^&#]*)').exec(url);
        return results != null ? results[1] : "";
    }
    
    static applyCountryCodeMap(
        countries: readonly string[],
        countryCodeMap: Readonly<Record<string, string>> | undefined,
    ): string[] {
        if (!countryCodeMap || Object.keys(countryCodeMap).length === 0) {
            return [...countries];
        }

        const mapped = countries.map((value) => countryCodeMap[value] ?? value);
        return Array.from(new Set(mapped));
    }
}