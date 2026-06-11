import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DataState } from "src/app/core/services/data-state";
import { API_PATH_PPC, API_V1 } from "../../constants/constants";
import { CloudToolsFileUploadResponse, SubscriptionTransferCustomer, SubsTransferRegion, SubsTransferUploadRequest, TransactionDetailsRequest, TransactionDetailsResponse, TransactionRequest, TransactionResponse } from "src/app/models/cloud-tools/cloud-tools.interface";
import { map, Observable } from "rxjs";
import { S1CommonHelper } from "src/app/s1-common.helper";

@Injectable({
    providedIn: "root",
})

export class CloudToolsAPIService {
    constructor(
        private readonly http: HttpClient,
        private readonly dataState: DataState,
    ) {}

    private readonly baseUrl = `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/vendortool`;
    private readonly SUBSCRIPTION_TRANSFER_ENDPOINT = 'subscriptiontransfer';

    /**
     * Retrieves transaction from the backend.
     *
     * @param {TransactionRequest} data - Request payload used to fetch transactions
     * @returns {Observable<TransactionResponse>} An observable that emits the transaction response
     */
    getTransactions(data: TransactionRequest): Observable<TransactionResponse> {        
        return this.http.post<TransactionResponse>(`${this.baseUrl}/transactions`, data);
    }

    /**
     * Retrieves transaction details from the backend.
     *
     * @param {TransactionDetailsRequest} data - Request payload used to fetch transaction details
     * @returns {Observable<TransactionDetailsResponse>} An observable that emits the transaction details response with parsed payloads
     */
    getTransactionDetails(data: TransactionDetailsRequest): Observable<TransactionDetailsResponse> {                
        return this.http.post<TransactionDetailsResponse>(`${this.baseUrl}/details`, data).pipe(
            map(res => ({
                ...res,
                transactionDetails: res.transactions.map(details => ({
                    ...details,
                    payload: S1CommonHelper.safeJsonParsePreserve(details.payload),
                    response: S1CommonHelper.safeJsonParsePreserve(details.response),
                })),
            })),
        );
    }

    /**
     * Uploads a file to the backend.
     *
     * @param {FormData} data - FormData containing the file
     * @param {string} endpoint - The specific endpoint to which the file should be uploaded (e.g., 'updatelcm', 'pcrcleanup', 'sandboxcleanup')
     * @returns {Observable<CloudToolsFileUploadResponse>} An observable that emits the upload response
     */
    uploadFileToCloudTools(data: FormData, endpoint: string): Observable<CloudToolsFileUploadResponse> {
        return this.http.post<CloudToolsFileUploadResponse>(`${this.baseUrl}/${endpoint}`, data);
    }

    /**
     * Retrieves the list of available subscription transfer regions from the backend.
     *
     * @returns {Observable<SubsTransferRegion[]>} An observable that emits an array of subscription transfer regions
     */
    getSubscriptionTransferRegions(): Observable<SubsTransferRegion[]> {        
        return this.http.get<SubsTransferRegion[]>(`${this.baseUrl}/${this.SUBSCRIPTION_TRANSFER_ENDPOINT}/regions`);
    }

    /**
     * Retrieves detailed information for a specific subscription transfer region.
     *
     * @param {string} regionKey - The unique identifier for the region
     * @returns {Observable<SubsTransferRegion>} An observable that emits the region details
     */
    getSubscriptionTransferRegionDetails(regionKey: string): Observable<SubsTransferRegion> {
        return this.http.get<SubsTransferRegion>(`${this.baseUrl}/${this.SUBSCRIPTION_TRANSFER_ENDPOINT}/regions/${regionKey}`);
    }

    /**
     * Retrieves the list of customers eligible for subscription transfer in a specific region.
     *
     * @param {string} regionKey - The unique identifier for the region
     * @param {string} mpnId - The Microsoft Partner Network ID
     * @returns {Observable<SubscriptionTransferCustomer[]>} An observable that emits an array of subscription transfer customers
     */
    getSubscriptionTransferCustomers(regionKey: string, mpnId: string): Observable<SubscriptionTransferCustomer[]> {       
        return this.http.get<SubscriptionTransferCustomer[]>(`${this.baseUrl}/${this.SUBSCRIPTION_TRANSFER_ENDPOINT}/customers?regionKey=${regionKey}&mpnId=${mpnId}`);
    }

    /**
     * Uploads a subscription transfer request to the backend.
     *
     * @param {SubsTransferUploadRequest} data - The subscription transfer payload
     * @returns {Observable<CloudToolsFileUploadResponse>} An observable that emits the upload response
     */
    subsTransferUpload(data: SubsTransferUploadRequest): Observable<CloudToolsFileUploadResponse> {              
        return this.http.post<CloudToolsFileUploadResponse>(`${this.baseUrl}/${this.SUBSCRIPTION_TRANSFER_ENDPOINT}/accept`, data);
    }    

    /**
     * Downloads the CSV file for a specific transaction.
     *
     * @param {string} transactionID - The unique identifier of the transaction to download
     * @returns An observable that emits the HTTP response containing the CSV file as a blob
     */
    downloadTransaction(transactionID: string): Observable<HttpResponse<Blob>> {
        const headers = new HttpHeaders({'Content-Type':'text/csv; charset=utf-8', 'Accept': 'text/csv'});
        return this.http.get(`${this.baseUrl}/transactions/${transactionID}/download`, {responseType: 'blob', observe: 'response', headers});
    }
}
