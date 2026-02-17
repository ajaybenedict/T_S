import { S1Menu } from "./s1-menu.interface";

export interface S1DataTableColumn {
    displayName: string; // for showing the name as per requirement
    columnKey: string; // for manipulating the columns in template. SHOULD BE UNIQUE.
    key?: string; // for mapping API key field
    isSortable: boolean;    
    columnWidth?: string;
    columnType: 'text' | 'btn' | 'dropdown' | 'html' | 'statusInfo' | 'dropdown-and-btn'; // statusInfo - intended only for C3 dashboard due to design limitations.
    formatter?: (data: any) => string;
    actions?: S1DataTableAction[];
    backgroundColor?: string;
    headerAlignment: 'center' | 'start' | 'end';
    cellAlignment: 'center' | 'start' | 'end';
    dropdown?: S1Menu;
    columnID: number; // for sorting
    isClickable?: boolean;
}

export interface S1DataTableAction {
    key: string;
    imgURL: string;
    tooltip: string;
    emitKey: string;
    customClass?: string;
}

export interface S1TableSortChangeEmitter {
    columnID: number;
    direction: SortDirectionEnum;
}

export enum SortDirectionEnum { 
    ASCENDING = 'ASC',
    DESCENDING = 'DESC',
}

export interface S1DataTableNoData {
    title?: string;
    context?: string;
    imgSrc?: string;
}