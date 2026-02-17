import { DisplayEntity } from '../models/display-entity';
import { DisplayTableComponent } from '../DisplayComponent/display-table.component';

export const IonDisplayOrder: DisplayEntity = {
  displayComponent: DisplayTableComponent,
  configuration: {
    columns: [
      /*{ id: "name", name: "Name" },*/
      
      { id: "orderId", name: "Order Id", markdown: "<a href=\'https://smp.shadow.apptium.com/v2/orb360-orders/order-list-detail/{{customerId}}/{{orderId}}' target='_blank'>{{orderId}}</a>" },
      { id: "customerId", name: "Customer Id" },
      { id: "orderName", name: "Order Name" },
      { id: "userName", name: "User" },
      { id: "status", name: "Status" },
      { id: "currencyCode", name: "Currency" },
      { id: "total", name: "Total Order Price" },
      { id: "productDetails", name: "Product Details" },
      { id: "quantity", name: "Quantity" },
      { id: "createTime", name: "Create Time", type: "date", format: "medium" },
      { id: "updateTime", name: "Update Time", type: "date", format: "medium" },
      
    ]
  }
}


