import { GetRulesRequest, Rule, RuleDetail, UpdateRuleRequest } from './../../models/rule-engine/rule-engine';
import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PPCNavData } from 'src/app/models/ppc-nav.model';
import { S1SearchBar } from 'src/app/models/s1/s1-search-bar.interface';
import { S1DataTableColumn, S1DataTableNoData } from 'src/app/models/s1/s1-data-table.interface';
import { RuleEngineApiService } from 'src/app/core/services/rule-engine/rule-engine-api.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RuleEngineDashboardHelper, RuleEngineHelper } from '../rule-engine-helper';
import { C3_RULE_ENGINE_WORKFLOW_ID, c3RuleEngineDialogConfig } from 'src/app/core/config/rule-engine.config';
import { catchError, of, switchMap, take, tap } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PpcDialogComponent } from 'src/app/shared/ppc-dialog/ppc-dialog.component';
import { DialogType, PPCDialogData } from 'src/app/models/ppc-dialog-data.model';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';
import { PPCDashboardAPIService } from 'src/app/core/services/ppc-dashboard-api.service';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { DataState } from 'src/app/core/services/data-state';
import { PermissionsEnum } from 'src/app/core/config/permissions.config';
import { RuleEngineDataService } from 'src/app/core/services/rule-engine/rule-engine-data.service';
import { RULE_ENGINE_ROUTE_CONFIG_URL } from 'src/app/core/constants/constants';

@Component({
  selector: 'app-rule-engine-dashboard',
  templateUrl: './rule-engine-dashboard.component.html',
  styleUrls: ['./rule-engine-dashboard.component.css']
})
export class RuleEngineDashboardComponent implements OnInit, AfterViewInit {
  declare searchBarData: S1SearchBar;
  declare navTabs: PPCNavData[];
  declare publishedColumn: S1DataTableColumn[];
  declare draftColumn: S1DataTableColumn[];
  declare publishedTableData: Rule[];
  declare draftTableData: Rule[];

  selectedRuleDetail: RuleDetail | null = null;
  selectedRuleId: string | null = null;
  showLoader = false;
  countryData!: { countries: SelectDropdown[], regions: SelectDropdown[] };
  getAllRulesPayload!: GetRulesRequest;
  
  private readonly workflowId = C3_RULE_ENGINE_WORKFLOW_ID;
  private readonly dialog = inject(MatDialog);
  private declare dialogRef: MatDialogRef<PpcDialogComponent>;
  
  hasEditAccess = this.dataState.hasPermission([PermissionsEnum.RuleEditor]);
  hasSearch = false; // used in sending no data message to S1DataTable
  clearSelectedRowTrigger = 0;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly ruleApiService: RuleEngineApiService,
    private readonly datePipe: DatePipe,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackbarSVC: PpcSnackBarService,
    private readonly dashboardApiSVC: PPCDashboardAPIService,
    private readonly dashboardDataSVC: PPCDashboardDataService,
    private readonly dataState: DataState,
    private readonly ruleEngineDataSVC: RuleEngineDataService,
  ) { }

  activeTab = 0;
  isDetailVisible = false;
  @ViewChild('published', { static: false }) publishedTable!: TemplateRef<any>; // type will be changed during integration
  @ViewChild('draft', { static: false }) draftTable!: TemplateRef<any>;

  ngOnInit(): void {
    this.getAllRulesPayload = { WorkflowId: this.workflowId, PageSize: 50, PageNumber: 1, SortBy: 'createdOn', SortOrder: 'desc' };
    this.initSearchBar();
    this.initTableData();
    this.getCountryRegions();
    this.ruleEngineDataSVC.setBreadcrumb('Rules Engine');
  }

  ngAfterViewInit(): void {
    this.initNavTab();
    this.initTableColumn();
    this.cdr.detectChanges();
  }

  private initSearchBar() {
    this.searchBarData = {
      placeHolder: 'Search your rules',
      width: '400px',
      searchText: '',
    }
  }

  get noDataMsg(): S1DataTableNoData | null {       
    return this.hasSearch ? null :
    {
      imgSrc: '/assets/no_data_undraw.svg',
      title: 'Looks Like You Have No Drafts',
      context: 'Rules you save as drafts/move to drafts will show up here for further editing or publishing.'
    };
  }  

  searchEventHandler(data: string) {                      
      this.getAllRulesPayload = {...this.getAllRulesPayload, SearchTerm: data};
      this.hasSearch = !!data;
      this.initTableData();      
  }

  private initNavTab() {
    this.navTabs = [
      {
        // TabIndex - 0
        label: 'Published',
        tabContent: this.publishedTable
      },
      {
        // TabIndex - 1
        label: 'Drafts',
        tabContent: this.draftTable,
      },
    ];
  }

  private initTableColumn() {
    const defaultCoulmns = [...RuleEngineDashboardHelper.getDefaultColumns(this.datePipe)]
    this.publishedColumn = [
      ...defaultCoulmns,
      ...(this.hasEditAccess ? [RuleEngineDashboardHelper.getActionColumn(false)] : [])
    ];
    this.draftColumn = [
      ...defaultCoulmns,
      ...(this.hasEditAccess ? [RuleEngineDashboardHelper.getActionColumn(true)] : [])
    ];
  }

  private initTableData() {
    this.showLoader = true;
    this.ruleApiService.getAllRules(this.getAllRulesPayload, this.workflowId).subscribe((res: Rule[]) => {
      if (res) {
        this.publishedTableData = res.filter(x => x.enabled);
        this.draftTableData = res.filter(x => !x.enabled);
        this.showLoader = false;
      }
    })
  }

  private getCountryRegions() {
    this.dashboardApiSVC.getCountriesWithRegion()
      .pipe(take(1)) // API will called only once during the component lifecycle and will be completed automatically. No unsub required.
      .subscribe({
        next: res => {
          if (res?.length) {
            this.dashboardDataSVC.setCountryRegionData(res);
            this.countryData = RuleEngineHelper.getAllCountryRegionList([...res]);
          }
        }
      });
  }

  onRowClick(row: Rule) {
    this.showLoader = true;
    this.selectedRuleDetail = null;
    this.selectedRuleId = row.id;
    this.getRuleById(this.selectedRuleId)
      .subscribe({
        next: res => {
          if (res) {
            this.selectedRuleDetail = res;
            if (row.enabled) {
              this.publishedColumn = [...this.publishedColumn.slice(0, 1)];
            } else {
              this.draftColumn = [...this.draftColumn.slice(0, 1)];
            }
            this.isDetailVisible = true;
            this.showLoader = false;
          }
        }
      });
  }

  tabChangeHandler(tab: number) {
    if (this.activeTab != tab) {
      this.isDetailVisible = false;
      this.initTableColumn();
      this.activeTab = tab;
    }
  }

  detailCardActionHandler(event: string) {
    switch (event) {
      case 'moveToDraft':
        if (this.selectedRuleId) this.openDialog('RuleEngineConfirmation', this.selectedRuleId, true);
        break;
      case 'moveToPublish':
        if (this.selectedRuleId) this.openDialog('RuleEngineConfirmation', this.selectedRuleId, false);
        break;
      case 'edit':        
        this.router.navigate([RULE_ENGINE_ROUTE_CONFIG_URL.EDIT, this.selectedRuleId], { relativeTo: this.route });
        break;
      case 'copy':
        this.router.navigate([RULE_ENGINE_ROUTE_CONFIG_URL.EDIT], { relativeTo: this.route, queryParams: { duplicateId: this.selectedRuleId } });        
        break;
      default:        
        this.isDetailVisible = false;
        this.initTableColumn();
        this.selectedRuleDetail = null;
        this.selectedRuleId = null;
        this.clearSelectedRowTrigger++;
        break;
    }
  }

  addRuleClick() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  tableActionEmitHandler(event: { emitKey: string, row: Rule }) {
    switch (event.emitKey) {
      case 'Edit':
        this.router.navigate([RULE_ENGINE_ROUTE_CONFIG_URL.EDIT, event.row.id], { relativeTo: this.route });
        break;
      case 'Duplicate':
        this.router.navigate([RULE_ENGINE_ROUTE_CONFIG_URL.EDIT], { relativeTo: this.route, queryParams: { duplicateId: event.row.id } });
        break;
      case 'MoveToDraft':
        this.openDialog('RuleEngineConfirmation', event.row.id, true);
        break;
      case 'MoveToPublish':
        this.openDialog('RuleEngineConfirmation', event.row.id, false);
        break;      
    }
  }

  private moveRule(ruleId: string, isDraft: boolean) {
    this.showLoader = true;
    let ruleName = '';
    this.getRuleById(ruleId)
      .pipe(
        tap(res => {
          if (res) {
            ruleName = res.name;
          }
        }),
        catchError(err => {
          console.error(`Error in GetRuleById API: ${err}`);
          this.showLoader = false;
          return of(null);
        }),
        switchMap(res => {
          if (res) {
            let dataToSend: UpdateRuleRequest = { ...res, isDraft: isDraft, ruleId: ruleId };
            return this.ruleApiService.updateRule(dataToSend, this.workflowId, ruleId)
          } else {
            return of(null);
          }
        }),

      ).subscribe({
        next: res => {
          if (res) {
            this.showLoader = false;
            this.snackbarSVC.show(`<span class="ppc-bold-txt">${ruleName}</span> ${isDraft ? 'moved to draft.' : 'has been published.'}`);
            this.initTableData();
          }
        },
        error: err => {
          console.error(`Error in UpdateRule API: ${err}`);
          this.showLoader = false;
        }
      });
  }

  private getRuleById(ruleId: string) {
    return this.ruleApiService.getRuleById(this.workflowId, ruleId);
  }

  private openDialog(type: DialogType, ruleId: string, isDraft: boolean) {
    this.closeDialog();
    let dialogData: { height: string, data: PPCDialogData };
    let position = { bottom: '0', right: '0' };
    let data: PPCDialogData = isDraft ? { ...c3RuleEngineDialogConfig['moveToDraft'], type } : {...c3RuleEngineDialogConfig['moveToPublish'], type };
    dialogData = {
      height: '229px',
      data,
    };
    this.dialogRef = this.dialog.open(
      PpcDialogComponent,
      {
        ...dialogData,
        width: '75vw',
        maxWidth: '75vw',
        disableClose: false,
        position
      }
    );
    this.dialogRef.afterClosed().subscribe(res => {
      if (res) {
        if (res == 'MoveToDraft') {
          this.moveRule(ruleId, true);
        } else if (res == 'MoveToPublish') {
          this.moveRule(ruleId, false);
        }
        this.isDetailVisible = false;
        this.initTableColumn();
        this.selectedRuleDetail = null;
        this.selectedRuleId = null;
      }
    });
  }

  private closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
