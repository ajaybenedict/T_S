import { DisplayTableComponent } from '../DisplayComponent/display-table.component';
import { DisplayEntity } from '../models/display-entity';


export const IonDisplayCustomer: DisplayEntity = {
  displayComponent: DisplayTableComponent,
  configuration: {
    columns: [
      /*{ id: "name", name: "Name" },*/
      {
        id: "name", name: "Customer Id", markdown: "<a href=\'https://smp.shadow.apptium.com/v2/orb360-customers/details/{{name}}/overview' target='_blank'>{{name}}</a>" },
      { id: "customerOrganization", name: "Customer Organization" },
      { id: "customerName", name: "Customer Name" },
      { id: "customerEmail", name: "Customer Email" },
      { id: "customerPhone", name: "Customer Phone" },
      { id: "createTime", name: "Create Time", type: "date", format:"medium" },
      { id: "updateTime", name: "Update Time", type: "date", format: "medium" },
      { id: "customerStatus", name: "Customer Status" }
    ]
  }
}
