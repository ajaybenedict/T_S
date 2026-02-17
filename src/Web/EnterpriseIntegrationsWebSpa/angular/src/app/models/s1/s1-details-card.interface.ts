import { OrderLineResponse } from "../ppc/order-line.interface";

export type S1DetailsCard = 
    | S1NeedsApprovalDetailsCard
    | S1ApprovedDeclinedDetailsCard;
export interface S1NeedsApprovalDetailsCard {
    orderLines: OrderLineResponse[];
    fx: string;
    tabType: C3DashboardTabTypeEnum.NeedsApproval;       
    outstanding: number;
    orderTotal: string;
}
export interface S1ApprovedDeclinedDetailsCard {
    orderLines: OrderLineResponse[];
    fx: string;
    tabType: C3DashboardTabTypeEnum.Approved | C3DashboardTabTypeEnum.Declined;    
    updatedBy: string;
    updatedOn: string;    
    approvalType: string;
    orderTotal: string;
}

export enum C3DashboardTabTypeEnum {
    NeedsApproval = 0,
    Approved = 1,
    Declined = 2,
};

export enum C3DetailsCardActionEnum {
    Goto = 'Goto',
    Approve = 'Approve',
    Decline = 'Decline',
    NeedsApproval = 'Needs Approval',
};