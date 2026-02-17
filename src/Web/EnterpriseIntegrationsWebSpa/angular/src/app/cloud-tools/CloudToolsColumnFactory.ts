import { ColumnConfig } from "../models/cloud-tools/cloud-tools.interface";
import { S1DataTableColumn } from "../models/s1/s1-data-table.interface";
import { CloudToolsHelper } from "./cloud-tools-helper";


export class CloudToolsColumnFactory {

  static buildColumn(
    config: ColumnConfig,
    isClickable: boolean
  ): S1DataTableColumn {
    return {
      columnID: config.id,
      columnKey: config.key,
      displayName: config.name,
      isSortable: false,
      columnType: 'html',
      columnWidth: config.width,
      headerAlignment: 'start',
      cellAlignment: 'start',
      formatter: config.formatter,
      isClickable,
    };
  }


  static regionColumn(isClickable: boolean): S1DataTableColumn {
    return this.buildColumn(
      {
        id: 1,
        key: 'regionKey',
        name: 'Region',
        width: '11%',
        formatter: d => `<span class="s1-FW700">${d.regionKey}</span>`,
      },
      isClickable
    );
  }

  static statusColumn(isClickable: boolean): S1DataTableColumn {
    return this.buildColumn(
      {
        id: 99,
        key: 'status',
        name: 'Status',
        width: '9%',
        formatter: d => CloudToolsHelper.styleStatusColumn(d.statusId, d.status),
      },
      isClickable
    );
  }


  static errorMessageColumn(isClickable: boolean): S1DataTableColumn {
    return this.buildColumn(
      {
        id: 100,
        key: 'errorMessage',
        name: 'Error Message',
        width: '9%',
        formatter: d => CloudToolsHelper.formatTransactionResponse(
          d,
          r => CloudToolsHelper.isTransactionErrorResponse(r)
            ? `<span class="s1-C-Cherry">${CloudToolsHelper.capitalizeFirst(r.ErrorMessage ?? '')}</span>`
            : '',
          'html'
        ),
      },
      isClickable
    );
  }

  static errorDetailsColumn(isClickable: boolean): S1DataTableColumn {
    return this.buildColumn(
      {
        id: 101,
        key: 'errorDetails',
        name: 'Error Details',
        formatter: d => CloudToolsHelper.formatTransactionResponse(
          d,
          r => CloudToolsHelper.isTransactionErrorResponse(r)
            ? `<span class="s1-C-Cherry">${CloudToolsHelper.capitalizeFirst(r.ErrorDetails?.[0]?.message ?? '')}</span>`
            : '',
          'html'
        ),
      },
      isClickable
    );
  }
}
