import { DisplayEntity } from '../models/display-entity';
import { DisplayTableComponent } from '../DisplayComponent/display-table.component';

export const IonDisplayInvoiceDetail: DisplayEntity = {
  displayComponent: DisplayTableComponent,
  configuration: {
    columns: [
      /*{ id: "name", name: "Name" },*/
      
      { id: "invoiceId", name: "Invoice Id", },
      { id: "invoiceUrl", name: "Invoice Download Url", markdown: "<a href=\'{{invoiceUrl}}' target='_blank'>Download Link</a>" }
      
    ]
  }
}


