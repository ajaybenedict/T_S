import { S1DataTableColumn } from "../models/s1/s1-data-table.interface";
import { CloudToolsHelper } from "./cloud-tools-helper";
import { CloudToolsColumnFactory } from "./CloudToolsColumnFactory";

export class SubsTransferColumns {

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
          key: 'azurePlan',
          name: 'Azure Plan',
          formatter: data => 
            CloudToolsHelper.formatTransactionDetails(
                data,
                d => CloudToolsHelper.formatBooleanValue(d.azurePlan)
            )
        },
        true
      ),

      CloudToolsColumnFactory.buildColumn(
        {
          id: 4,
          key: 'budget',
          name: 'Budget',
          formatter: data => 
            CloudToolsHelper.formatTransactionDetails(
                data,
                d => CloudToolsHelper.formatBooleanValue(d.budget)
            )
        },
        true
      ),

      CloudToolsColumnFactory.buildColumn(
        {
          id: 5,
          key: 'outputMessage',
          name: 'Output',
          enableEllipsisTooltip: true,
          formatter: (_) =>
            `<span class="s1-FW700 s1-C-Charcoal">${outputMessage}</span>`,
        },
        true
      )
    ];
  }
}