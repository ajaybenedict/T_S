import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_BASE_CONTROLLER, API_ENTRY_URL } from "../constants/constants";
import { Country, Vendor } from "../interface/filter-api.interface";

@Injectable({ providedIn: 'root' })

export class FilterDataAPIService {
  constructor(
    private readonly http: HttpClient
  ) { }

  private readonly baseURI = `${API_ENTRY_URL}` + `${API_BASE_CONTROLLER}`;

  getVendorNames() {  
    const url = `/GetVendorNames`;
    return this.http.get<Vendor[]>(this.baseURI + url);
  }

  getCountryNames() {  
    const url = `/GetCountryNames`;
    return this.http.get<Country[]>(this.baseURI + url);
  }


}