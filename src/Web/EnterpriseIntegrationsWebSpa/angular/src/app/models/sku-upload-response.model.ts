export interface SKUUploadResponseData {
    accountId: number;
    productId: string;
    displayName: string;
    scope: string;
    productSyncStatus: 0 | 1 | 2 | 3;
    syncMessage: string;
    productIdUrl: string;
}

export interface SKUUploadReqData {
    batchId: string;
}