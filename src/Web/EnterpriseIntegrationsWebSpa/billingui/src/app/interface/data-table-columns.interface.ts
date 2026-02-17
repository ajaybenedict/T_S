export interface TableColumn {
  columnName: string;
  key: string;
  className?: string;
  stickyPosition?: 'left' | 'right';
  stickyIndex?: number;
  pipe?: string;
  pipeArgs?: any;
  actions?:string[];
  actionsIsDropdown?: boolean;
  isStatus?: boolean;
  showCheckbox?: boolean;
}


// data-table-columns.interface.ts
export interface GroupedTableColumns{
  key: string;
  columnName: string;
  isFrozen?: boolean;
  groupHeaderPosition?: 'left' | 'right' | 'none';
  showInGroupHeader?:boolean;
  valueGetter?: (rowData: any, orderData: any)  => string | number | boolean | null;
  pipe?: string;
  pipeArgs?: any;
  isCheckbox?: boolean;
  className?: string;
  actionKeys?:string[];
  actionsIsDropdown?: boolean;
  isStatus?: boolean;
  isGroupColumn ?: boolean;
  parentKey?: string;

}

