import { S1DataTableColumn } from "../models/s1/s1-data-table.interface";
import { CloudToolsHelper } from "./cloud-tools-helper";
import { CloudToolsColumnFactory } from "./CloudToolsColumnFactory";


export class UpdateMPNIDColumns {

  static base(outputMessage: string): S1DataTableColumn[] {
    return [
      CloudToolsColumnFactory.regionColumn(true),

      CloudToolsColumnFactory.buildColumn(
        {
          id: 2,
          key: 'customerId',
          name: 'Customer Tenant ID',
          enableEllipsisTooltip: true,
          formatter: d =>
            CloudToolsHelper.formatTransactionPayload(
              d,
              p => CloudToolsHelper.getCustomerTenantId(p)
            ),
        },
        true
      ),

      CloudToolsColumnFactory.buildColumn(
        {
          id: 3,
          key: 'outputMessage',
          name: 'Output',
          enableEllipsisTooltip: true,
          formatter: d => {
            // Keep column message aligned with per-row API response details.
            const rowErrorMessage = CloudToolsHelper.getTransactionErrorMessage(d.response);
            const finalMessage = rowErrorMessage || outputMessage;
            return `<span class="s1-FW700 s1-C-Charcoal">${finalMessage}</span>`;
          },
        },
        true
      )
    ];
  }
}
