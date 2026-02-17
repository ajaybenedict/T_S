import { DatePipe } from "@angular/common";
import { CloudToolType } from "../core/config/cloud-tools.config";
import { CloudToolsStatusIdEnum } from "../models/cloud-tools/cloud-tools.interface";
import { S1DataTableColumn } from "../models/s1/s1-data-table.interface";
import { CloudToolsHelper } from "./cloud-tools-helper";
import { CloudToolsColumnFactory } from "./CloudToolsColumnFactory";
import { ESTColumns } from "./ESTColumns";
import { PCRCleanupColumns } from "./PCRCleanupColumns";
import { SandboxCleanupColumns } from "./SandboxCleanupColumns";


export class CloudToolsTableColumnBuilder {

  static build(tool: CloudToolType, tab: CloudToolsStatusIdEnum, datePipe?: DatePipe, msg: string = ''): S1DataTableColumn[] {

    const toolColumns = this.getToolColumns(tool, msg);
    const isClickable = tool !== CloudToolType.EST;
    const statusColumns = tab === CloudToolsStatusIdEnum.Failed
      ? [
        CloudToolsColumnFactory.statusColumn(isClickable),
        CloudToolsColumnFactory.errorMessageColumn(isClickable),
        CloudToolsColumnFactory.errorDetailsColumn(isClickable),
      ]
      : [
        CloudToolsColumnFactory.statusColumn(isClickable),
      ];

    const successExtra: S1DataTableColumn[] = [];

    if (tab === CloudToolsStatusIdEnum.Success && datePipe) {
      successExtra.push({
        columnID: 50,
        columnKey: 'updatedAt',
        displayName: 'Updated At',
        isSortable: false,
        columnType: 'html',
        headerAlignment: 'start',
        cellAlignment: 'start',
        formatter: (d: any) => d.updatedDate
          ? `${CloudToolsHelper.getOrderDateTime(d.updatedDate, 'date', datePipe)}
                     | ${CloudToolsHelper.getOrderDateTime(d.updatedDate, 'time', datePipe)}`
          : '',
        isClickable: true,
      });
    }

    return [
      ...toolColumns,
      ...successExtra,
      ...statusColumns,
    ];
  }

  private static getToolColumns(tool: CloudToolType, msg: string): S1DataTableColumn[] {
    switch (tool) {
      case CloudToolType.EST:
        return ESTColumns.base();
      case CloudToolType.SandboxCleanup:
        return SandboxCleanupColumns.base(msg);
      case CloudToolType.PCRCleanup:
        return PCRCleanupColumns.base(msg);
    }
  }
}
