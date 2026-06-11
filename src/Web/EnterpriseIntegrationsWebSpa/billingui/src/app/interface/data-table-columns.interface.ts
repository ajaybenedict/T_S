export type CellValue = string | number | boolean | null;
// data-table-columns.interface.ts
export interface GroupedTableColumns{
  key: string;
  columnName: string;
  isFrozen?: boolean;
  isGroupKey?: boolean;
  groupHeaderPosition?: 'left' | 'right' | 'none';
  showInGroupHeader?:boolean;
  valueGetter?: (rowData: any, orderData: any)  => CellValue[];
  pipe?: string;
  pipeArgs?: any;
  isCheckbox?: boolean;
  className?: string;
  actionKeys?:string[];
  actionsIsDropdown?: boolean;
  isStatus?: boolean;
  isGroupColumn ?: boolean;
  parentKey?: string;
  templateId?: string;
}


export interface FlattenedTableColumns {
  key: string;
  columnName: string;
  className?: string;
  templateId?: string;
  valueGetter?: (rowData: any)  => CellValue[];
}

