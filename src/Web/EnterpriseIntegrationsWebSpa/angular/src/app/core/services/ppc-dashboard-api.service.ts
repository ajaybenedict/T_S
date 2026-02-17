import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core"
import { DataState } from "./data-state";
import { API_PATH_PPC, API_V1 } from "../constants/constants";
import { OrderActionRequest, OrderRequest, OrderResponse } from "src/app/models/ppc/order-api.interface";
import { CountryRegionResponse } from "src/app/models/ppc/country-region-api.interface";
import { OrderLineRequest, OrderLineResponse } from "src/app/models/ppc/order-line.interface";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})

export class PPCDashboardAPIService {
    constructor(
        private readonly http: HttpClient,
        private readonly dataState: DataState,
    ){}

    private readonly baseURI = `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}`;

    getOrders(data: OrderRequest) {
        return this.http.post<OrderResponse[]>(this.baseURI + '/order/Orders', data);
    }

    orderAction(data: OrderActionRequest, api: string) {
        return this.http.post<boolean>(`${this.baseURI}/order/${api}`, data);
    }

    getCountriesWithRegion() {
        return this.http.get<CountryRegionResponse[]>(this.baseURI + '/country/Countries');
    }

    getOrderLines(data: OrderLineRequest): Observable<OrderLineResponse[]> {
        return this.http.post<OrderLineResponse[]>(`${this.baseURI}/order/Orderlines`, data);
    }
}