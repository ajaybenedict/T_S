export interface PPCPaginatorData {
    page: number;
    pageSize: number;
    total: number;
    pageSizeOption?: number[];
}

export interface PPCPageChangeEventData {
    page: number;
    pageSize: number;
}