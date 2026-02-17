import { DisplayEntity } from '../models/display-entity';
import { DisplayTableComponent } from '../DisplayComponent/display-table.component';

export const IonDisplayProduct: DisplayEntity = {
  displayComponent: DisplayTableComponent,
  configuration: {
    columns: [
      /*{ id: "name", name: "Name" },*/
      
      { id: "productId", name: "Product Id", markdown: "<a href=\'https://smp.shadow.apptium.com/v2/orb360-marketplace/product-details?shortName={{productId}}' target='_blank'>{{productId}}</a>" },
      { id: "productName", name: "Product Name" },
      { id: "productExternalId", name: "Product External Id" },
      { id: "skuId", name: "Sku Id" },
      { id: "skuName", name: "Sku Name" },
      { id: "skuExternalId", name: "Sku External Id" },
      { id: "planId", name: "Plan Id" },
      { id: "planName", name: "Plan Name" },
      { id: "planBillingPeriod", name: "Plan Billing Period" },
      
    ]
  }
}
