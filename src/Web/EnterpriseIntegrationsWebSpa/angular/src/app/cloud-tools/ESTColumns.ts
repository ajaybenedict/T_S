import { S1DataTableColumn } from "../models/s1/s1-data-table.interface";
import { CloudToolsHelper } from "./cloud-tools-helper";
import { CloudToolsColumnFactory } from "./CloudToolsColumnFactory";


export class ESTColumns {

  static base(): S1DataTableColumn[] {
    return [
      CloudToolsColumnFactory.regionColumn(false),

      CloudToolsColumnFactory.buildColumn(
        {
          id: 2,
          key: 'subscriptionId',
          name: 'Subscription ID',
          formatter: d =>
            CloudToolsHelper.formatTransactionPayload(
              d,
              p => p.subscriptionId
            ),
        },
        false
      ),

      CloudToolsColumnFactory.buildColumn(
        {
          id: 3,
          key: 'customerId',
          name: 'Customer ID',
          formatter: d =>
            CloudToolsHelper.formatTransactionPayload(
              d,
              p => p.customFields?.customerId
            ),
        },
        false
      ),
    ];
  }
}
