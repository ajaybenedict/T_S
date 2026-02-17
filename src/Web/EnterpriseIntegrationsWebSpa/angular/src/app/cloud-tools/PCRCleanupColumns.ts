import { S1DataTableColumn } from "../models/s1/s1-data-table.interface";
import { CloudToolsHelper } from "./cloud-tools-helper";
import { CloudToolsColumnFactory } from "./CloudToolsColumnFactory";


export class PCRCleanupColumns {

  static base(outputMessage: string): S1DataTableColumn[] {
    return [
      CloudToolsColumnFactory.regionColumn(true),

      CloudToolsColumnFactory.buildColumn(
        {
          id: 2,
          key: 'customerId',
          name: 'Customer Tenant ID',
          formatter: d =>
            CloudToolsHelper.formatTransactionPayload(
              d,
              p => p.customerId
            ),
        },
        true
      ),

      CloudToolsColumnFactory.buildColumn(
        {
          id: 3,
          key: 'outputMessage',
          name: 'Output',
          formatter: (_) =>
            `<span class="s1-FW700 s1-C-Charcoal">${outputMessage}</span>`,
        },
        true
      )
    ];
  }
}
