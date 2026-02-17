export class Helper {
    static getUrlQueryParam(key: string, url: string | null = null) {
        url = url ?? window.location.href;
        const results = new RegExp('[?&]' + key + '=([^&#]*)').exec(url);
        return results != null ? results[1] : "";
    } 
}