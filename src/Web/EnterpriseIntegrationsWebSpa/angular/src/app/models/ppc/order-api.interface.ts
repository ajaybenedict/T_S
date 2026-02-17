import { SortDirectionEnum } from "../s1/s1-data-table.interface";
import { ApprovalTypeFilterEnum } from "./ppc-filter.interface";

export interface OrderRequest {
    DateFilterType: string; //"custom"
    OrderFromDate: string; //"2025-01-01"
    OrderToDate: string; //"2025-03-26"
    StatusFilter: 0 | 1;
    Status: string; //"1,2,3,5,7"
    CountryFilter: 0 | 1;
    Country: number[]; //[74, 70, 46]
    CountryValues: string[]; //??
    TextSearch: 0 | 1;
    SearchText: string; //"687"
    Region: number[]; //[6]
    RegionValues: string[]; //??
    RegionFilter: 0| 1;
    ApprovalType: ApprovalTypeFilterEnum[];
    ApprovalTypeValues: number[];
    ApprovalTypeFilter: 0 | 1;
    AmountMin: number;
    AmountMax: number;
    AmountFilter: 0 | 1; // OrderValue in PPC Sidepanel
    PageIndex: number;
    PageSize: number;
    SortOrder: SortDirectionEnum;
    OrderByColumn: SortColumnEnum;   // 1 || 2 || 3 -- ColumnNumber  
}

export interface OrderResponse {
    actions: number;
    approvalType: string;
    availableCredit: number;
    contactName: string;
    country: string;
    currency: string;
    orderDate: string;
    orderKey: string;
    orderValue: number | null;
    resellerCost: string;
    outstanding: number; //unbilled uasage
    resellerID: string;
    resellerName: string;
    totalRows: number;
    updatedBy: string;
    updatedOn: string;
    creditLimit: number; // Tt. Credit
    available: number; // Av. Credit
    arBalance: number; // ArBalance
    pastDueAmount: number; // PastDueAmount
    pendingAmount: number; // PendingAmount 
    restricted: boolean | null;
    discontinued: boolean | null;
    id: number;
}

// Use it for approving/declining the order
export interface OrderActionRequest {
    OrderKey: string;
    OrderStatus: number; // Approve - 9, Decline - 10, Needs Approval - 2
    UpdatedBy: string;
}

export enum SortColumnEnum {
    ORDERDETAILS = 1,
    COUNTRY = 2,
    ORDERVALUE = 3,
}
