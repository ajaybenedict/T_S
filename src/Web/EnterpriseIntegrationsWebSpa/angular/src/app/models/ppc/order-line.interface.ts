export interface OrderLineRequest {
    OrderID: number;
}

export interface OrderLineResponse {
    address: string;
    endCustomerName: string;
    contactName: string;
    phoneContact: string;
    emailContact: string;
    orderLines: OrderLine[];
}

export interface OrderLine {
    vendorName: string;
    qty: 2;
    fx: string;
    value: number;
    partNumber: string;
    billingFrequency: string;
    billingType: string;
    orderType: string;
}