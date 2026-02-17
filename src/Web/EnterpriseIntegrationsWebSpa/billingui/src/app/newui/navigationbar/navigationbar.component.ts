import {
  Component,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  EventEmitter,
  Output,
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { REMOTE_ENTRY_URL } from 'src/app/constants/constants';
import { NavigationBarButtonConfigs } from 'src/app/config/navigation-bar-buttons.config';
import { catchError, combineLatest, map, of } from 'rxjs';
import { TableViewControlService } from 'src/app/services/table-view-control.service';
import { Button } from 'src/app/interface/button.interface';
import { ExpandState } from 'src/app/services/table-view-control.service';
import { ManageColumnService } from 'src/app/services/manage-table-column.service';
import { DownloadReportService } from 'src/app/services/download-report.service';
export interface PPCNavData<T = unknown> {
  label: string;
  tabContent?: TemplateRef<T>;
}

@Component({
  selector: 'app-navigationbar',
  templateUrl: './navigationbar.component.html',
  styleUrls: ['./navigationbar.component.css'],
})
export class NavigationbarComponent implements AfterViewInit {
  @ViewChild('tabContainer', { read: ViewContainerRef })
  container!: ViewContainerRef;

  @Output() typeChanged = new EventEmitter<string>();

  // Observable of dynamically updated buttons
  dynamicButtonConfigs$ = combineLatest([
    this.tableControlService.isExpanded$,
    of(NavigationBarButtonConfigs),
  ]).pipe(
    map(([expandState, staticButtons]: [ExpandState, Button[]]) => {
      const isExpanded = expandState.isExpanded;

      const updatedButtons = [...staticButtons];

      const index = updatedButtons.findIndex((btn) => btn.key === 'toggleExpandCollapse');
      if (index !== -1) {
        updatedButtons[index] = {
          ...updatedButtons[index],
          key: 'toggleExpandCollapse',
          label: isExpanded ? 'Collapse All' : 'Expand All',
          icon: isExpanded ? 'cbc/collapsedOrder' : 'cbc/expandedOrder',
        };
      }

      return updatedButtons;
    }),
    catchError((error) => {
      console.error('Error while updating dynamic button configs:', error);
      return of([]);
    })
  );



  constructor(private readonly tableControlService: TableViewControlService,
    private readonly managecolumnservice: ManageColumnService,
    private readonly downloadReportService: DownloadReportService) { }

  currentTabIndex = 0;

  async ngAfterViewInit() {
    const module = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './navbar',
    });

    const componentRef = this.container.createComponent(module.PpcNavTabsComponent);

    const tabs: PPCNavData[] = [
      { label: 'Billing List' },
      { label: 'Approved' },
      { label: 'Completed' },
      { label: 'Declined' }

    ];


    componentRef.setInput('tabs', tabs);
    componentRef.setInput('selectedIndex', this.currentTabIndex);

    componentRef.changeDetectorRef.detectChanges();

    const instance = componentRef.instance as any;

    instance.tabChange?.subscribe((index: number) => {
      this.currentTabIndex = index;
      this.emitType(index);
    });
  }


  emitType(index: number) {
    const types = ['BillingList', 'Approved', 'Completed', 'Declined'];
    this.currentTabIndex = index;
    this.typeChanged.emit(types[index] || 'NONE');
  }


  dashboardActionClicked(key: string) {
    if (key == 'toggleExpandCollapse') {
      this.tableControlService.toggleGroups();
    }
    else if (key == 'Download') {
      this.downloadReportService.open();
    }
    else {
      this.managecolumnservice.open();
    }

  }

}
