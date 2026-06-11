import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_BASE_CONTROLLER, API_ENTRY_URL } from "../constants/constants";
import { Observable } from "rxjs";
import { InvoiceListRequestPayload, InvoiceList } from "../interface/cbc-dashboard-api.interface";

@Injectable({ providedIn: 'root' })

export class CBCDashboardAPIService {
  constructor(
    private readonly http: HttpClient
  ) { }

  private readonly baseURI = `${API_ENTRY_URL}` + `${API_BASE_CONTROLLER}`;


  getInvoiceListInformation(payload: InvoiceListRequestPayload): Observable<InvoiceList[]> {
    return this.http.post<InvoiceList[]>(this.baseURI + '/GetInvoiceList', payload);
  }


  updateOrderStatus(statusType: number, orderIds: number[]): Observable<any> {
    const url = `/UpdateOrderStatus/${statusType}`;
    return this.http.post(this.baseURI + url, orderIds);  
  }


  getOrderLineItem(salesOrderHeaderId: string) { 
    const url = `/GetOrderDetail/${salesOrderHeaderId}`;
    return this.http.get<any>(this.baseURI + url);
  }

  getOrderLineItemDetails(OrderLineItemId: string) { 
    const url = `/GetInvoiceLineDetails/${OrderLineItemId}/1/20`; // For testing we added page number as number.. in ux screen there is infinite scroll lets check with tariq regards this
    return this.http.get<any>(this.baseURI + url);
  }


}