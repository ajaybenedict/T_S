export interface ApprovalTypeFilter {
    displayName: string;
    key: ApprovalTypeFilterEnum;
    description: string;
}

export enum ApprovalTypeFilterEnum  {
    Manual = 1,
    Auto = 2,
    ERP = 3,
}

export enum PPCFilterTypeEnum {
    ApprovalType = 'ApprovalType',
    OrderValue = 'OrderValue',
    Country = 'Country',
};

export type PPCFilterButtonData = {
    [key in PPCFilterTypeEnum]: {
        displayName: string;
        onClickEvent: string;
    };
}

export type PPCFilterCount = {
    [key in PPCFilterTypeEnum]: number;
}