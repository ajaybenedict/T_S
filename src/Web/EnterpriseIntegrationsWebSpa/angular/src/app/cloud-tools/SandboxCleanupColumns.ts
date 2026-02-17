import { S1DataTableColumn } from "../models/s1/s1-data-table.interface";
import { CloudToolsHelper } from "./cloud-tools-helper";
import { CloudToolsColumnFactory } from "./CloudToolsColumnFactory";


export class SandboxCleanupColumns {

  static base(outputMessage: string): S1DataTableColumn[] {
    return [
      CloudToolsColumnFactory.regionColumn(true),

      CloudToolsColumnFactory.buildColumn(
        {
          id: 2,
          key: 'domain',
          name: 'Domain Name',
          formatter: d =>
            CloudToolsHelper.formatTransactionPayload(
              d,
              p => p.domain
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
      ),
    ];
  }
}
