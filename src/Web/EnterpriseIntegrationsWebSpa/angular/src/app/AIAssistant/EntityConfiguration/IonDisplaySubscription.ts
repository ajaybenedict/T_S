import { DisplayEntity } from '../models/display-entity';
import { DisplayTableComponent } from '../DisplayComponent/display-table.component';

export const IonDisplaySubscription: DisplayEntity = {
  displayComponent: DisplayTableComponent,
  configuration: {
    columns: 
      [
        { "id": "subscriptionId", "name": "Subscription Id", markdown: "<a href=\'https://smp.shadow.apptium.com/v2/orb360-subscriptions/account-subscription-detail/{{customerId}}/{{subscriptionId}}' target='_blank'>{{subscriptionId}}</a>" },
        { "id": "customerId", "name": "Customer Id" },
        { "id": "partnerName", "name": "Partner Name" },
      //  { "id": "resellerId", "name": "Reseller Id" },
        { "id": "cloudProviderId", "name": "Cloud Provider Id" },
        { "id": "VendorSubscriptionId", "name": "Vendor Subscription Id" },
        { "id": "subscriptionName", "name": "Subscription Name" },
      //  { "id": "resourceType", "name": "Resource Type" },
        //{ "id": "ccpProductId", "name": "Ccp Product Id" },
        //{ "id": "ccpSkuId", "name": "Ccp Sku Id" },
        //{ "id": "ccpPlanId", "name": "Ccp Plan Id" },
        { "id": "subscriptionTotalLicenses", "name": "Quantity" },
        //{ "id": "unitType", "name": "Unit Type" },
        { "id": "subscriptionStatus", "name": "Status" },
        { "id": "subscriptionBillingType", "name": "Billing Type" },
        { "id": "subscriptionBillingCycle", "name": "Billing Cycle" },
        { "id": "subscriptionBillingTerm", "name": "Billing Term" },
        { "id": "subscriptionRenewStatus", "name": "Renew Status" },
       // { "id": "productId", "name": "Product Id" },
        { "id": "productDetails", "name": "Product Details" },
        //{ "id": "skuId", "name": "Sku Id" },
        //{ "id": "skuDisplayName", "name": "Sku Display Name" },
        //{ "id": "planId", "name": "Plan Id" },
        //{ "id": "planDisplayName", "name": "Plan Display Name" },
        //{ "id": "customerName", "name": "Customer Name" },
        //{ "id": "partnerName", "name": "Partner Name" }
      ]
      
    
  }
}


 


