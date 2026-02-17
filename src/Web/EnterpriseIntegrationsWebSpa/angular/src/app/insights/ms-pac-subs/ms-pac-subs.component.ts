import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IReportEmbedConfiguration, models } from 'powerbi-client';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { insightActionBarConfig, InsightReportName, ReportCandidate } from 'src/app/core/config/insight-dashboard.config';
import { INSIGHT_DASHBOARD_ROUTE } from 'src/app/core/constants/constants';
import { DataState } from 'src/app/core/services/data-state';
import { InsightDataService } from 'src/app/core/services/insights/insight-data.service';
import { InsightsDashboardApiService } from 'src/app/core/services/insights/insights-dashboard-api.service';
import { PermissionsLoaderDialogService } from 'src/app/core/services/permissions-loader-dialog.service';
import { InsightResolverResponse, InsightsDashboardResponse } from 'src/app/models/insights/insights-dashboard-api-response.interface';
import { PPCNavData } from 'src/app/models/ppc-nav.model';
import { S1ActionBar } from 'src/app/models/s1/s1-action-bar.interface';

@Component({
  selector: 'app-ms-pac-subs',
  templateUrl: './ms-pac-subs.component.html',
  styleUrls: ['./ms-pac-subs.component.css'],
})
export class MsPacSubsComponent implements OnInit, AfterViewInit {
  
  declare navTabs: PPCNavData[];
  declare userPermissions: number[];
  declare actionbarData: S1ActionBar;
  embedConfig: IReportEmbedConfiguration | null = null;
  activeTab = 0;
  reportCommand$ = new BehaviorSubject<string>('');

  @ViewChild('report', { static: false }) reportTab !: TemplateRef<void>;
  
  private candidates: ReportCandidate[] = [];
  
  constructor(
    private readonly route: ActivatedRoute,
    private readonly routeLoaderSVC: PermissionsLoaderDialogService,
    private readonly insightsSVC: InsightsDashboardApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly dataState: DataState,
    private readonly insightDataSVC: InsightDataService,
  ) { }

  ngOnInit(): void {
    this.actionbarData = {...insightActionBarConfig};
    this.userPermissions = this.dataState.getUserPermissions();    
  }

  ngAfterViewInit(): void {
    const resolverData: InsightResolverResponse | null = this.route.snapshot.data[INSIGHT_DASHBOARD_ROUTE.RESOLVER];
    if (resolverData) {      
      const {reportCandidate, reportData} = resolverData;
      this.candidates = [...reportCandidate];
      // modify embedURL & page as per report
      const defaultPage = reportCandidate[0].defaultPage;
      const pageParam = defaultPage ? `&pageName=${defaultPage}` : '';
      this.constructEmbedConfig(
        resolverData.reportCandidate[0].reportName, 
        { 
          ...reportData, 
          embedUrl: `${reportData.embedUrl}${pageParam}`,
        }
      );
    }
    this.routeLoaderSVC.closeDialog();
    this.buildNavTabsReactive();
    this.cdr.detectChanges();
  }

  private buildNavTabsReactive() {
    this.navTabs = this.candidates.map((c) => ({
      label: c.label ?? c.reportName,
      tabContent: this.reportTab,      
    }));         
  }

  private constructEmbedConfig(reportName: InsightReportName, reportData: InsightsDashboardResponse) {
    if (!reportData) return;
    const { db, region, country } = this.insightDataSVC.resolvePageFilterConfig(reportName, reportData.embedUrl);
    this.embedConfig = {
      type: 'report',
      id: reportData.reportId,
      embedUrl: reportData.embedUrl,
      accessToken: reportData.accessToken,
      tokenType: models.TokenType.Embed,
      filters: db ? this.filterConfig(db, region, country) : undefined,
      settings: {
        panes: {
          filters: { visible: false },
          pageNavigation: { visible: !reportData.embedUrl.includes('&pageName') }
        },
        hyperlinkClickBehavior: models.HyperlinkClickBehavior.RaiseEvent,
        background: models.BackgroundType.Default
      }
    };
  }

  tabChangeEventHandler(eventValue: number) {
    let previousTab = this.activeTab;
    this.activeTab = eventValue;
    if (previousTab == this.activeTab) return; //To avoid trigerring the logic during the init of NavTab
    this.routeLoaderSVC.showDialog('Loader');
    this.embedConfig = null;
    const candidate = this.candidates[this.activeTab]
    this.getAccessToken(candidate.reportName, candidate.defaultPage ?? undefined);    
  }

  private getAccessToken(reportName: InsightReportName, page: string | undefined) {
    this.insightsSVC.getAccessToken(reportName, page).pipe(
      catchError(err => {
        console.error(`"${reportName}" in Insight dashboard service got failed with error message - ${err}.`);
        this.routeLoaderSVC.closeDialog();
        return of(null);
      })
    ).subscribe({
      next: res => {
        if (res) {
          this.constructEmbedConfig(reportName, { ...res, embedUrl: page ? `${res.embedUrl}&pageName=${page}` : res.embedUrl });
          this.routeLoaderSVC.closeDialog();
        }
      }
    });
  }

  private filterConfig(db: string, region: string | undefined, country: string | undefined): models.ReportLevelFilters[] {
    const userRegionPermission = {
      Region: this.dataState.getUserRegions(),
      Country: this.dataState.getUserCountries()
    }
    return this.insightDataSVC.getRegionPermissions(userRegionPermission, db, region, country);    
  }

  resetAllFilters(event: string) {
    this.reportCommand$.next(event);
  }
}
