export interface ProductSyncAPIRequest {
    searchTerm: string;
    pageSize: number;
    pageNumber: number;
    IsSuccessHistory: boolean;
}
export interface ProductSyncResult {
    accountId: string;
    productId: string;
    environment: string;
    productName: string;
    message: string;
    productIdUrl: string;
}
export interface ProductSyncAPIResponse {
    userName: string;
    fileName: string;
    logCreateTime: string;
    totalCount: number
    totalSuccess: number;
    totalError: number;
    totalRecordCount: number;
    batchId: string;
    result: ProductSyncResult[];
}