import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_BASE_CONTROLLER, API_ENTRY_URL } from "../constants/constants";
import { Observable } from "rxjs";

export interface OrderPageParams {
  fromMonth: number;
  fromDay: number;
  fromYear: number;
  toMonth: number;
  toDay: number;
  toYear: number;
  isSomething: boolean;
  startIndex: number;
  pageSize: number;
  sortBy: string;
  isFlag: boolean;
  status: number;
  sortDir: string;
  search: string;
  filter1: number;
  filter2: number;
  filter3: number;

}

@Injectable({ providedIn: 'root' })

export class CBCDashboardAPIService {
  constructor(
    private readonly http: HttpClient
  ) { }

  private readonly baseURI = `${API_ENTRY_URL}` + `${API_BASE_CONTROLLER}`;


  getOrdersPage(params: OrderPageParams) {
    const {
      fromMonth, fromDay, fromYear,
      toMonth, toDay, toYear,
      isSomething, startIndex, pageSize,
      sortBy, isFlag, status,
      sortDir, search, filter1, filter2, filter3
    } = params;

    const url = `/GetPageOfOrderHeaders/${fromMonth}/${fromDay}/${fromYear}/${toMonth}/${toDay}/${toYear}/${isSomething}/${startIndex}/${pageSize}/${sortBy}/${isFlag}/${status}/${sortDir}/${search}/${filter1}/${filter2}/${filter3}`;

    return this.http.get<any>(this.baseURI + url);
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