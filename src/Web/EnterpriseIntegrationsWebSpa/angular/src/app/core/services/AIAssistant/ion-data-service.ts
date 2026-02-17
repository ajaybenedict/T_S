import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, from, map, Observable, of, throwError } from 'rxjs';
import { DisplayEntity } from '../../../AIAssistant/models/display-entity';
import { ApiDataService } from './api-data-service';
import { ApiDataResponse } from '../../../AIAssistant/models/api-data-response';
import { environment } from '../../../environments/environment.int'; // Adjust the path as necessary
import { DisplayIonData } from '../../../AIAssistant/EntityConfiguration/DisplayIonData';
import { DataState } from '../data-state';
import { JsonHelper } from './json-helper';
import { IonDisplayCustomer } from '../../../AIAssistant/EntityConfiguration/IonDisplayCustomer'
import { IonDisplayProduct } from '../../../AIAssistant/EntityConfiguration/IonDisplayProduct';
import { IonDisplayOrder } from '../../../AIAssistant/EntityConfiguration/IonDisplayOrder';
import { IonDisplaySubscription } from '../../../AIAssistant/EntityConfiguration/IonDisplaySubscription';
import { IonDisplayInvoiceDetail } from '../../../AIAssistant/EntityConfiguration/IonDisplayInvoiceDetail';

@Injectable({
  providedIn: 'root'
})

export class IonApiDataService extends ApiDataService {
  private ionApiBaseUrl = 'https://smp.shadow.apptium.com/api/v3';
  private ionApiV1BaseUrl = 'https://smp.shadow.apptium.com/api/v1';
  private accountId = 2767;
  private pageSize = 5

  //private httpOptions = {
  //  headers: new HttpHeaders({
  //    'Content-Type': 'application/json',
  //    'Authorization': 'Bearer ' + this.ionApiKey
  //    // 'Cookie' header is generally not used in API requests like this
  //  })
  //};

  constructor(private http: HttpClient) {
    super();
    this.apiSource = "ion"

    //this.setApiKey();
  }

  setApiKey() {
    if (localStorage.getItem("ionApiKey")) {
    //  this.ionApiKey = localStorage.getItem("ionApiKey").toString();
    }
  }

  public override addCommonHeaders(headers?: HttpHeaders): HttpHeaders {
    headers = new HttpHeaders();
    // headers = headers.append('apiSource', this.apiSource); ///do not add else cors error from ion
    headers = headers.append('Authorization', 'Bearer ' + this.ionApiKey);
    headers = headers.append('Content-Type', 'application/json');

    // headers = headers.append('X-RapidAPI-Host', this.apiDataBaseUrl);
    // Add more headers as needed
    return headers;
  }

  private getV1Headers(): HttpHeaders {
    // Your API key and secret
    const apiKey = 'Mjc2NyNzbXByZXNlbGxlckBhcHB0aXVtLmNvbSMj';
    const apiSecret = 'JBC5AWsyW6asQBwSnwTY3nEWxl86Fo23';

    // Combine the API key and secret, then Base64 encode them
    const base64Auth = btoa(`${apiKey}:${apiSecret}`);

    // Create headers with the encoded authorization
    const headers = new HttpHeaders({
      'Authorization': `Basic ${base64Auth}`,
      'Content-Type': 'application/json'
    });

    return headers;
  }
  getApiData(functionName: any, argumentsParams: any, pageToken: any = null): Observable<any> {
    this.setApiKey();
    if (functionName) {
      //let argumentsParams = JSON.parse(toolsOutput.function.arguments);
      //let functionName = JSON.parse(toolsOutput.function.name);
      this.displayTitle = "Below are the results that match your criteria";
      this.isInlineAnalysis = true;
      switch (functionName) {
        case "getCustomer":
          return this.getCustomer(argumentsParams);
        case "listCustomers":
          return this.listCustomers(argumentsParams, pageToken);
        case "createOrUpdateCustomer":
          return this.createOrUpdateCustomer(argumentsParams);
        case "getProduct":
          return this.getProduct(argumentsParams);
        case "listProducts":
          return this.listProducts(argumentsParams, pageToken);
        case "getOrder":
          return this.getOrder(argumentsParams);
        case "listOrders":
          return this.listOrders(argumentsParams, pageToken);
        case "createNewOrder":
          return this.createNewOrder(argumentsParams);
        case "updateOrder":
          return this.updateOrder(argumentsParams);
        case "listSubscriptions":
          return this.listSubscriptions(argumentsParams);
        case "getInvoiceDetail":
          return this.getInvoiceDetail(argumentsParams);
        default:
          return of(null);
      }

    }
    return of(null);
  }

  getDisplayComponent(functionName: any): DisplayEntity | null {
    if (functionName) {
      //let argumentsParams = JSON.parse(toolsOutput.function.arguments);
      //let functionName = JSON.parse(toolsOutput.function.name);


      //switch (functionName) {
      //  case "getCustomer":
      //    return IonDisplayCustomer;
      //  case "listCustomers":
      //    return IonDisplayCustomer
      //  case "createOrUpdateCustomer":
      //    return IonDisplayCustomer
      //  case "getProduct":
      //    return IonDisplayProduct;
      //  case "listProducts":
      //    return IonDisplayProduct;
      //  case "getOrder":
      //    return IonDisplayOrder;
      //  case "listOrders":
      //    return IonDisplayOrder;
      //  case "listSubscriptions":
      //    return IonDisplaySubscription;
      //  default:
      //    return null;

      if (functionName.includes("Customer")) {
        return IonDisplayCustomer;
      } else if (functionName.includes("Product")) {
        return IonDisplayProduct;
      } else if (functionName.includes("Order")) {
        return IonDisplayOrder;
      } else if (functionName.includes("Subscription")) {
        return IonDisplaySubscription;
      } else if (functionName.includes("InvoiceDetail")) {
        return IonDisplayInvoiceDetail;
      } else {
        return null;
      }

    }
    return null;
  }


  getCustomer(argumentParams: any): Observable<any> {

    return this.http.get<ApiDataResponse>(`${this.ionApiBaseUrl}/accounts/${this.accountId}/customers/${argumentParams.customerId}`, { headers: this.addCommonHeaders() })
      .pipe(map((response: any) => {
        let data = JsonHelper.filterArrayFirstLevelFields(JsonHelper.getArray(response));
        data = data.map((item: any) => ({
          ...item,
          name: this.getObjectId(item.name).toString() // Update name field with the ID extracted
        }));
        let apiResponse = this.mapToResponse(response, data)
        return apiResponse;
      }
      ),
        catchError(this.handleError));

  }

  public override mapToResponse(response: any, data: any): ApiDataResponse {
    let apiDataResponse: ApiDataResponse = {};
    apiDataResponse.data = data
    apiDataResponse.isError = false;
    apiDataResponse.error = "";
    if (response.nextPageToken)
      apiDataResponse.pagination = { nextPageToken: response.nextPageToken }


    return apiDataResponse;

  }

  listCustomers(argumentParams: any, pageToken = null): Observable<any> {
    let apiUrl = `${this.ionApiBaseUrl}/accounts/${this.accountId}/customers?pageSize=${this.pageSize}`;
    if (argumentParams) {
      if (argumentParams.customerName)
        apiUrl += `&filter.customerName=${argumentParams.customerName}`


      if (argumentParams.customerEmail)
        apiUrl += `&filter.customerEmail=${argumentParams.customerEmail}`

      if (argumentParams.customerStatus)
        apiUrl += `&filter.customerStatus=${argumentParams.customerStatus}`
    }

    apiUrl = this.addPageToken(apiUrl, pageToken)
    return this.http.get<ApiDataResponse>(apiUrl, { headers: this.addCommonHeaders() })
      .pipe(map((response: any) => {
        let data = JsonHelper.filterArrayFirstLevelFields(JsonHelper.getArray(response.customers));
        data = data.map((item: any) => ({
          ...item,
          name: this.getObjectId(item.name).toString() // Update name field with the ID extracted
        }));
        let apiResponse = this.mapToResponse(response, data)
        return apiResponse;
      }
      ),
        catchError(this.handleError));

  }
  createOrUpdateCustomer(argumentParams: any): Observable<any> {
    let customerRequest: any = {};
    customerRequest = JSON.parse(JSON.stringify(argumentParams));
    delete customerRequest.customerAddressStreet;
    delete customerRequest.customerAddressSuite;
    delete customerRequest.customerAddressCity;
    delete customerRequest.customerAddressState;
    delete customerRequest.customerAddressZip;
    delete customerRequest.customerAddressCountry;

    customerRequest.customerAddress = {
      "street": argumentParams.customerAddressStreet,
      "suite": argumentParams.customerAddressSuite,
      "city": argumentParams.customerAddressCity,
      "state": argumentParams.customerAddressState,
      "zip": argumentParams.customerAddressZip,
      "country": argumentParams.customerAddressCountry
    };

    // Base API URL
    let apiUrl = `${this.ionApiBaseUrl}/accounts/${this.accountId}/customers`;

    // Determine if it's a POST or PUT operation based on customerId
    const httpMethod = argumentParams.customerId ? 'PUT' : 'POST';

    // Update the apiUrl for PUT operation
    if (argumentParams.customerId) apiUrl = `${apiUrl}/${argumentParams.customerId}`;

    // Set the request options with the headers
    const requestOptions = {
      body: customerRequest,
      headers: this.addCommonHeaders()
    };

    return this.http.request<ApiDataResponse>(httpMethod, apiUrl, requestOptions)
      .pipe(
        map((response: any) => {
          this.isInlineAnalysis = false;
          this.displayTitle = "Customer was successfully created. Below are the details of the customer"
          this.systemMessage = "Do not summarize anything. Do not  display any message";
          let data = JsonHelper.filterArrayFirstLevelFields(JsonHelper.getArray(response));
          data = data.map((item: any) => ({
            ...item,
            name: this.getObjectId(item.name).toString() // Update name field with the ID extracted
          }));
          let apiResponse = this.mapToResponse(response, data);
          return apiResponse;
        }),
        catchError(this.handleError)
      );
  }



  getProduct(argumentParams: any): Observable<any> {

    return this.http.get<ApiDataResponse>(`${this.ionApiBaseUrl}/accounts/${this.accountId}/products/${argumentParams.productId}`, { headers: this.addCommonHeaders() })
      .pipe(map((response: any) => {
        let data = this.mapProduct(JsonHelper.getArray(response));
        let apiResponse = this.mapToResponse(response, data)
        return apiResponse;
      }
      ),
        catchError(this.handleError));
  }



  listProducts(argumentParams: any, pageToken = null): Observable<any> {
    let apiUrl = `${this.ionApiBaseUrl}/accounts/${this.accountId}/products?pageSize=${this.pageSize}`;
    if (argumentParams) {
      if (argumentParams.name)
        apiUrl += `&filter.name=${argumentParams.name}`


      if (argumentParams.skuExternalId)
        apiUrl += `&filter.skuExternalId=${argumentParams.skuExternalId}`

      if (argumentParams.skuDisplayName)
        apiUrl += `&filter.skuDisplayName=${argumentParams.skuDisplayName}`

    }
    return this.http.get<ApiDataResponse>(apiUrl, { headers: this.addCommonHeaders() })
      .pipe(map((response: any) => {
        let data = this.mapProduct(JsonHelper.getArray(response.products));
        let apiResponse = this.mapToResponse(response, data)
        return apiResponse;
      }
      ),
        catchError(this.handleError));
  }

  mapProduct(products: any) {
    const targetProducts: any = [];

    products.forEach((product: any) => {
      product.definition.skus.forEach((sku: any) => {
        sku.plans.forEach((plan: any) => {
          const transformedProduct: any = {
            productId: this.getObjectId(product.name),
            productName: product.marketing.displayName,
            skuId: sku.id,
            skuName: sku.displayName,
            skuExternalId: sku.productId,
            planId: plan.id,
            planName: plan.displayName,
            planBillingPeriod: plan.billingPeriod,
          };
          targetProducts.push(transformedProduct);
        });
      });
    });

    return targetProducts;
  }




  listOrders(argumentParams: any, pageToken = null): Observable<any> {
    let apiUrl = `${this.ionApiBaseUrl}/accounts/${this.accountId}/orders?pageSize=${this.pageSize}`;
    if (argumentParams) {
      if (argumentParams.status)
        apiUrl += `&status=${argumentParams.status}`

    }

    apiUrl = this.addPageToken(apiUrl, pageToken);
    return this.http.get<ApiDataResponse>(apiUrl, { headers: this.addCommonHeaders() })
      .pipe(map((response: any) => {
        let data = this.mapOrder(JsonHelper.getArray(response.orders));
        let apiResponse = this.mapToResponse(response, data)
        return apiResponse;
      }
      ),
        catchError(this.handleError));
  }

  getOrder(argumentParams: any): Observable<any> {
    return this.http.get<ApiDataResponse>(`${this.ionApiBaseUrl}/accounts/${this.accountId}/customers/${argumentParams.customerId}/orders/${argumentParams.orderId}`, { headers: this.addCommonHeaders() })
      .pipe(map((response: any) => {
        let data = this.mapOrder(JsonHelper.getArray(response));
        let apiResponse = this.mapToResponse(response, data)
        return apiResponse;
      }
      ),
        catchError(this.handleError));
  }


  createNewOrder(argumentParams: any): Observable<any> {
    //  console.log(argumentParams);

    // Base API URL
    let apiUrl = `${this.ionApiBaseUrl}/accounts/${this.accountId}/customers/${argumentParams.customerId}/orders`;

    // Determine if it's a POST or PUT operation based on customerId
    const httpMethod = 'POST';

    const orderRequest = this.getNewOrderPayload(argumentParams);

    //    console.log(orderRequest);

    const requestOptions = {
      body: orderRequest,
      headers: this.addCommonHeaders()
    };


    return this.http.request<ApiDataResponse>(httpMethod, apiUrl, requestOptions)
      .pipe(map((response: any) => {
        this.displayTitle = "Order was successfully created. Below are the details of the order"
        this.systemMessage = "Do not summarize anything. Do not  display any message";
        this.isInlineAnalysis = false;
        let data = this.mapOrder(JsonHelper.getArray(response));
        let apiResponse = this.mapToResponse(response, data)
        return apiResponse;
      }),
        catchError(this.handleError)

    );
  }

  updateOrder(argumentParams: any): Observable<any> {
    // console.log(argumentParams);

    // Base API URL
    let apiUrl = `${this.ionApiBaseUrl}/accounts/${this.accountId}/customers/${argumentParams.customerId}/orders`;

    // Determine if it's a POST or PUT operation based on customerId
    const httpMethod = 'POST';

    const orderRequest = this.getUpdateOrderPayload(argumentParams);


    const requestOptions = {
      body: orderRequest,
      headers: this.addCommonHeaders()
    };

    //console.log(orderRequest);

    return this.http.request<ApiDataResponse>(httpMethod, apiUrl, requestOptions)
      .pipe(map((response: any) => {
        this.displayTitle = "Order was successfully Updated. Below are the details of the order"
        this.systemMessage = "Do not summarize anything. Do not  display any message";
        this.isInlineAnalysis = false;
        let data = this.mapOrder(JsonHelper.getArray(response));
        let apiResponse = this.mapToResponse(response, data)
        return apiResponse;
      }),
        catchError(this.handleError));
  }


  listSubscriptions(argumentParams: any, pageToken = null): Observable<any> {
    let apiUrl = `${this.ionApiBaseUrl}/accounts/${this.accountId}/subscriptions?pagination.limit=${this.pageSize}&pagination.offset=0`;
    if (argumentParams) {
      if (argumentParams.name)
        apiUrl += `&providerId=${argumentParams.providerId}`


      if (argumentParams.subscriptionId)
        apiUrl += `&subscriptionId=${argumentParams.subscriptionId}`

      if (argumentParams.customerId)
        apiUrl += `&customerId=${argumentParams.customerId}`

    }
    return this.http.get<ApiDataResponse>(apiUrl, { headers: this.addCommonHeaders() })
      .pipe(map((response: any) => {
        let data = this.mapSubscription(JsonHelper.getArray(response.items));
        let apiResponse = this.mapToResponse(response, data)
        return apiResponse;
      }
      ),
        catchError(this.handleError));
  }

  //getSubscription(argumentParams: any): Observable<any> {
  //  return this.http.get<ApiDataResponse>(`${this.ionApiBaseUrl}/accounts/${this.accountId}/subscription/${argumentParams.orderId}`, this.httpOptions)
  //    .pipe(map((response: any) => {
  //      response = this.mapProduct(JsonHelper.getArray(response));
  //      let apiResponse = this.mapToResponse(response)
  //      return apiResponse;
  //    }
  //    ),
  //      catchError(this.handleError));
  //}

  getInvoiceDetail(argumentsParam: any): Observable<any> {

    let ionApiUrl = `${this.ionApiV1BaseUrl}/invoices/${argumentsParam.invoiceId}/detailed`;
    const headers = this.getV1Headers();

    return this.http.get<ApiDataResponse>(`${ionApiUrl}`, { headers })
      .pipe(map((response: any) => {
        let data = this.mapInvoiceDetail(JsonHelper.getArray(response.data));
        let apiResponse = this.mapToResponse(response, data)
        return apiResponse;
      }
      ),
        catchError(this.handleError));

  }

  mapInvoiceDetail(invoices: any) {
    const targetInvoices: any[] = []
    invoices.forEach((item: any) => {
      item.invoice.detailedInvoiceFilesUrls.forEach((item2: any) => {
        const targetInvoice: any = {
          invoiceId: item.invoice.id,
          invoiceUrl: item2
        }
        targetInvoices.push(targetInvoice);
      })
    });

    return targetInvoices;
  }

  mapOrder(orders: any) {
    const targetOrders: any[] = [];

    orders.forEach((order: any) => {
      order.orderItems.forEach((item: any) => {
        const targetOrder: any = {
          orderId: this.getObjectId(order.name),
          customerId: this.getObjectId(order.name, 3),
          orderName: order.displayName,
          userName: order.userName,
          status: order.status,
          currencyCode: order.currencyCode,
          total: order.total,
          productDetails: `ProductId: ${item.productId}<br>Sku Id: ${item.skuId}<br>PlanId: ${item.planId}}`,
          quantity: item.quantity,
          createTime: order.createTime,
          updateTime: order.updateTime,
          scheduledAt: order.scheduledAt,
        };
        targetOrders.push(targetOrder);
      });
    });

    return targetOrders;
  }

  mapSubscription(subscriptions: any) {
    const targetSubs: any[] = [];
    subscriptions.forEach((item: any) => {
      let targetSub: any = {
        subscriptionId: item.id,
        customerId: item.customerId,
        resellerId: item.resellerId,
        cloudProviderId: item.cloudProviderId,
        VendorSubscriptionId: item.subscriptionId,
        subscriptionName: item.subscriptionName,
        resourceType: item.resourceType,
        subscriptionTotalLicenses: item.subscriptionTotalLicenses,
        unitType: item.unitType,
        subscriptionStatus: item.subscriptionStatus,
        subscriptionBillingType: item.subscriptionBillingType,
        subscriptionBillingCycle: item.subscriptionBillingCycle,
        subscriptionBillingTerm: item.subscriptionBillingTerm,
        subscriptionRenewStatus: item.subscriptionRenewStatus,
        // Check for null ccpProductInfo and provide default values if necessary
        //productId: item.ccpProductInfo ? item.ccpProductInfo.productId : '',
        //productDisplayName: item.ccpProductInfo ? item.ccpProductInfo.productDisplayName : '',
        //skuId: item.ccpProductInfo ? item.ccpProductInfo.skuId : '',
        //skuDisplayName: item.ccpProductInfo ? item.ccpProductInfo.skuDisplayName : '',
        //planId: item.ccpProductInfo ? item.ccpProductInfo.planId : '',
        //planDisplayName: item.ccpProductInfo ? item.ccpProductInfo.planDisplayName : '',
        productDetails: `ProductId: ${(item.ccpProductInfo ? item.ccpProductInfo.productId : '')}<br>Sku Id: ${item.ccpProductInfo ? item.ccpProductInfo.skuId : ''}<br>PlanId: ${item.ccpProductInfo ? item.ccpProductInfo.planId : ''}}`,
        customerName: item.customerName,
        partnerName: item.partnerName
      }
      targetSubs.push(targetSub);
    });

    return targetSubs;
  }

  getNewOrderPayload(attributesParam: any) {

    const orderItem: any = {
      referenceId: attributesParam.orderItemReferenceId,
      productId: attributesParam.orderItemProductId,
      skuId: attributesParam.orderItemSkuId,
      planId: attributesParam.orderItemPlanId,
      action: attributesParam.orderItemAction,
      quantity: attributesParam.orderItemQuantity,
      endCustomerPO: attributesParam.orderItemEndCustomerPO,
      resellerPO: attributesParam.orderItemResellerPO,
      attributes: [
        { name: 'domainName', value: attributesParam.orderItemAttributesDomainName },
        { name: 'agreementDateAgreed', value: attributesParam.orderItemAttributesAgreementDateAgreed },
        { name: 'agreementUserId', value: attributesParam.orderItemAttributesAgreementUserId },
        { name: 'agreementEmail', value: attributesParam.orderItemAttributesAgreementEmail },
        { name: 'agreementFirstName', value: attributesParam.orderItemAttributesAgreementFirstName },
        { name: 'agreementLastName', value: attributesParam.orderItemAttributesAgreementLastName },
        { name: 'agreementPhoneNumber', value: attributesParam.orderItemAttributesAgreementPhoneNumber },
        { name: 'companyRegistrationId', value: attributesParam.companyRegistrationId }
      ]
    };

    return {
      referenceId: attributesParam.referenceId,
      displayName: attributesParam.displayName,
      orderItems: [orderItem]
    };

  }


  getUpdateOrderPayload(attributesParam: any) {

    const orderItem: any = {
      referenceId: attributesParam.orderItemReferenceId,
      resourceId: attributesParam.orderItemResourceId,
      productId: attributesParam.orderItemProductId,
      skuId: attributesParam.orderItemSkuId,
      planId: attributesParam.orderItemPlanId,
      providerId: attributesParam.orderItemProviderId,
      action: attributesParam.orderItemAction,
      quantity: attributesParam.orderItemQuantity,
      attributes: [
        { name: 'operations', value: attributesParam.orderItemAttributesOperations },
        { name: 'status', value: attributesParam.orderItemAttributesAgreementStatus },
        { name: 'statusUpdate', value: attributesParam.orderItemAttributesStatusUpdate },
        { name: 'renewalSetting', value: attributesParam.orderItemAttributesRenewalSetting },
        { name: 'friendlyName', value: attributesParam.orderItemAttributesFriendlyName }
      ]
    };

    return {
      referenceId: attributesParam.referenceId,
      name: attributesParam.name,
      orderItems: [orderItem]
    };

  }
  getObjectId(url: string, segNo: number | null = null) {
    const segments = url.split('/');
    segNo = segNo || segments.length - 1
    const lastSegment = segments[segNo];
    return lastSegment; // Converts the last segment to a number
  }

  addPageToken(apiUrl: any, nextPageToken: any) {
    if (nextPageToken)
      apiUrl = `${apiUrl}&pageToken=${nextPageToken}`

    return apiUrl;
  }

  postAiResponseHandler(data?: any) {

  }
}

