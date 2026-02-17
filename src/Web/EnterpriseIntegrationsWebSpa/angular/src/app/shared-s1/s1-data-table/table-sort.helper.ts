import { S1TableSortChangeEmitter, SortDirectionEnum } from "src/app/models/s1/s1-data-table.interface";

export class TableSortHelper {
  static toggleSort(state: S1TableSortChangeEmitter, columnID: number): S1TableSortChangeEmitter {
    const isSameColumn = state.columnID === columnID;
    
    if (!isSameColumn) {
      return { columnID: columnID, direction: SortDirectionEnum.ASCENDING };
    }

    return {
      columnID: columnID,
      direction: state.direction == SortDirectionEnum.ASCENDING ? SortDirectionEnum.DESCENDING : SortDirectionEnum.ASCENDING
    }
  }

  static isSortedAsc(state: S1TableSortChangeEmitter, columnID: number): boolean {
    return state.columnID === columnID && state.direction === SortDirectionEnum.ASCENDING;
  }

  static isSortedDesc(state: S1TableSortChangeEmitter, columnID: number): boolean {
    return state.columnID === columnID && state.direction === SortDirectionEnum.DESCENDING;
  }
}