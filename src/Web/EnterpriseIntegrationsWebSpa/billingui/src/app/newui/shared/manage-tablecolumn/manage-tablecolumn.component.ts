import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ManageColumnService } from 'src/app/services/manage-table-column.service';
import { ColumnConfig } from 'src/app/interface/manage-column.interface';
import { TabButton } from 'src/app/interface/button.interface';

@Component({
  selector: 'app-manage-tablecolumn',
  templateUrl: './manage-tablecolumn.component.html',
  styleUrls: ['./manage-tablecolumn.component.css']
})
export class ManageTablecolumnComponent implements OnInit {
  headername = 'Manage Column';
  isOpen: boolean = false;
  activeTab: string = '';
  @Input() columns: ColumnConfig[] = [];
  @Input() tabs: TabButton[] = [];

  activeTabColumns: ColumnConfig[] = [];
  @Output() UpdatedColumns = new EventEmitter<ColumnConfig[]>();

  constructor(private readonly cdr: ChangeDetectorRef, private readonly manageColumnService: ManageColumnService) { }

  ngOnInit() {
    this.manageColumnService.isOpen$.subscribe(value => {
      this.isOpen = value;
    });


    this.setActiveTabFromConfig();
    this.setActiveTabColumns(this.activeTab);
  }

  closePanel() {
    this.manageColumnService.close();
  }

  drop(event: CdkDragDrop<ColumnConfig[]>, group: ColumnConfig[]) {
    moveItemInArray(group, event.previousIndex, event.currentIndex);

    const updateColumnsForActiveTab = (group: ColumnConfig[], isMultiTab: boolean) => {
      const newColumns: ColumnConfig[] = [];
      const groupName = group[0].groupname;

      this.activeTabColumns.forEach(col => {
        if (col.groupname === groupName) {
          if (!newColumns.some(c => c.groupname === groupName)) {
            newColumns.push(...group);
          }
        } else if (!col.isfreezedColumn) {
          newColumns.push(col);
        }
      });

      this.activeTabColumns = newColumns;
      this.cdr.detectChanges();
    };

    const isMultiTab = this.tabs.length > 1;
    const updatedTab = this.tabs.find(tab => tab.displayName === this.activeTab);

    if (isMultiTab && updatedTab) {
      updateColumnsForActiveTab(group, true);
    } else {
      updateColumnsForActiveTab(group, false);
    }
  }


  setActiveTabColumns(tabName: string) {
    let filteredColumns: ColumnConfig[];

    if (this.tabs.length > 0) {
      filteredColumns = this.columns.filter(col => col.tabname === tabName && !col.isfreezedColumn);
    } else {
      filteredColumns = this.columns.filter(col => !col.isfreezedColumn);
    }

    this.activeTabColumns = filteredColumns;
  }

  setActiveTabFromConfig() {
    const activeTab = this.tabs.find(tab => tab.selected === true);
    if (activeTab) {
      this.activeTab = activeTab.displayName;
    } else {
      this.activeTab = this.tabs.length > 0 ? this.tabs[0].displayName : '';
    }
  }

  groupColumns(columns: ColumnConfig[]) {
    const groups: { [key: string]: ColumnConfig[] } = {};
    columns.forEach(col => {
      const group = col.groupname || '';
      if (!groups[group]) groups[group] = [];
      groups[group].push(col);
    });
    return Object.values(groups);
  }

  trackByGroup(index: number, group: ColumnConfig[]) {
    return index;
  }

  filterButtonChange(tabName: string) {
    this.activeTab = tabName;
    this.setActiveTabColumns(tabName);
  }

  resetAll() {

    if (this.tabs.length > 0) {
      this.columns.forEach(col => {
        if (col.tabname === this.activeTab) {
          col.visible = true;
        }
      });

    }
    else {
      this.columns.forEach(col => (col.visible = true));
    }
    this.manageColumnService.updateColumns(this.activeTab, this.columns);
    this.closePanel();
  }

  applyChanges() {
    const updatedColumns: ColumnConfig[] = [];
    const nonFrozenColumns = this.activeTabColumns.filter(col => !col.isfreezedColumn);

    let startFrozenColumns: ColumnConfig[] = [];
    let endFrozenColumns: ColumnConfig[] = [];
    let lastFrozenIndex = -1;
    let flag = 0;

    const isMultipleTabs = this.tabs.length > 1;

    this.columns.forEach((col, i) => {
      const isFrozen = col.isfreezedColumn && (isMultipleTabs ? col.tabname === this.activeTab : true);

      if (isFrozen) {
        if (lastFrozenIndex === -1 || i - lastFrozenIndex === 1 && flag === 0) {
          startFrozenColumns.push(col);
        } else {
          endFrozenColumns.push(col);
          flag = 1;
        }
        lastFrozenIndex = i;
      }
    });

    updatedColumns.push(...startFrozenColumns, ...nonFrozenColumns, ...endFrozenColumns);

    this.UpdatedColumns.emit(updatedColumns);
    this.manageColumnService.updateColumns(this.activeTab, updatedColumns);
    this.closePanel();
  }

  toggleVisibility(col: ColumnConfig) {
    col.visible = !col.visible;
  }
}