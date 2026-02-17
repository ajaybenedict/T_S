import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DataState } from "src/app/core/services/data-state";
import { API_PATH_PPC, API_V1 } from "../../constants/constants";
import { CloudToolsFileUploadResponse, TransactionDetailsRequest, TransactionDetailsResponse, TransactionRequest, TransactionResponse } from "src/app/models/cloud-tools/cloud-tools.interface";
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

    /**
    * Retrieves transaction from the backend.
    *
    * @param data - Request payload used to fetch transactions
    * @returns An observable that emits the transaction response
    */
    getTransactions(data: TransactionRequest): Observable<TransactionResponse> {
        return this.http.post<TransactionResponse>(`${this.baseUrl}/transactions`, data);
    }

    /**
    * Retrieves transaction details from the backend.
    *
    * @param data - Request payload used to fetch transaction details
    * @returns An observable that emits the transaction details response
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
    * @param data - FormData containing the file
    * @param endpoint - The specific endpoint to which the file should be uploaded (e.g., 'updatelcm', 'pcrcleanup', 'sandboxcleanup')
    * @returns An observable that emits the upload response
    */
    uploadFileToCloudTools(data: FormData, endpoint: string): Observable<CloudToolsFileUploadResponse> {
        return this.http.post<CloudToolsFileUploadResponse>(`${this.baseUrl}/${endpoint}`, data);
    }

}
