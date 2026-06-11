import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IReportEmbedConfiguration, models } from 'powerbi-client';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { insightActionBarConfig, InsightReportName, ReportCandidate } from 'src/app/core/config/insight-dashboard.config';
import { FRAUD_ALERT_POPUP_INPUTS, INSIGHT_DASHBOARD_ROUTE } from 'src/app/core/constants/constants';
import { DataState } from 'src/app/core/services/data-state';
import { InsightDataService } from 'src/app/core/services/insights/insight-data.service';
import { InsightsDashboardApiService } from 'src/app/core/services/insights/insights-dashboard-api.service';
import { PermissionsLoaderDialogService } from 'src/app/core/services/permissions-loader-dialog.service';
import { FraudAlertPopupService } from 'src/app/core/services/insights/fraud-alert-popup.service';
import { InsightResolverResponse, InsightsDashboardResponse } from 'src/app/models/insights/insights-dashboard-api-response.interface';
import { PPCNavData } from 'src/app/models/ppc-nav.model';
import { S1ActionBar } from 'src/app/models/s1/s1-action-bar.interface';
import { PowerbiReportWrapperComponent } from 'src/app/shared/powerbi-report-wrapper/powerbi-report-wrapper.component';
import { BulkupdateFraudeventPopupComponent } from '../bulkupdate-fraudevent-popup/bulkupdate-fraudevent-popup.component';
import { SidePanelService } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.service';
import { ApplicationIdEnum } from 'src/app/core/config/permissions.config';
import { Helper } from '../helper';

@Component({
  selector: 'app-insights-dashboard',
  templateUrl: './insights-dashboard.component.html',
  styleUrls: ['./insights-dashboard.component.css'],
})
export class InsightsDashboardComponent implements OnInit, AfterViewInit {

  embedConfig: IReportEmbedConfiguration | null = null;
  reportCommand$ = new BehaviorSubject<string>('');
  declare actionbarData: S1ActionBar;
  navTabs: PPCNavData[] = [];
  activeTab = 0;
  canLoadReport = false;
  canShowBulkUpdateButton: boolean  = false;
  canEnableBulkUpdate = false;
  showValidationError = false;
  validationErrorMsg = '';
  hiddenPages: string[] = [];
  reportName:string = '';

  apiErrorImg = '/assets/ApiErrorFrame.svg';
  apiErrorTitle = 'Unable to load the report';
  apiErrorContext = 'Failed to fetch the report. Try again or contact support if the problem persists.';
  reportFailed: boolean = false;

  @ViewChild('report', { static: false }) reportTab!: TemplateRef<void>;
  @ViewChild(PowerbiReportWrapperComponent) powerBIWrapper!: PowerbiReportWrapperComponent;

  private candidates: ReportCandidate[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly routeLoaderSVC: PermissionsLoaderDialogService,
    private readonly insightsSVC: InsightsDashboardApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly dataState: DataState,
    private readonly insightDataSVC: InsightDataService,
    private readonly popupSVC: FraudAlertPopupService,
    private readonly sidePanelSVC: SidePanelService,
  ) { }

  ngOnInit() {
    this.actionbarData = { ...insightActionBarConfig };
  }

  ngAfterViewInit(): void {
    const resolverData: InsightResolverResponse | null = this.route.snapshot.data[INSIGHT_DASHBOARD_ROUTE.RESOLVER];
    if (!resolverData) {
      this.reportFailed = true;
      console.error('No resolver data found');
      this.routeLoaderSVC.closeDialog();
      return;
    }

    const { reportCandidate, reportData } = resolverData;
    this.candidates = [...reportCandidate];
    const defaultPage = reportCandidate[0].defaultPage;
    const pageParam = defaultPage ? `&pageName=${defaultPage}` : '';
    const candidate = reportCandidate[0];

    this.canLoadReport = true;
    this.hiddenPages = candidate.hiddenPage ?? [];
    this.reportName = candidate.reportName;
    this.canShowBulkUpdateButton = candidate.isBulkUpdate === true;
    this.buildNavTabsReactive();
    this.constructEmbedConfig(candidate, { ...reportData, embedUrl: `${reportData.embedUrl}${pageParam}` });
    this.routeLoaderSVC.closeDialog();
    this.cdr.detectChanges();
  }

  private buildNavTabsReactive() {
    this.navTabs = this.candidates.map((candidate) => ({
      label: candidate.label ?? candidate.reportName,
      tabContent: this.reportTab,
    }));
  }

  tabChangeEventHandler(eventValue: number) {
    this.showValidationError = false;
    this.canEnableBulkUpdate = false;
    const previousTab = this.activeTab;
    this.activeTab = eventValue;
    if (previousTab === this.activeTab) return;

    this.routeLoaderSVC.showDialog('Loader');
    this.embedConfig = null;

    const candidate = this.candidates[this.activeTab];
    this.hiddenPages = candidate.hiddenPage ?? [];
    this.reportName = candidate.reportName;
    this.canShowBulkUpdateButton = candidate.isBulkUpdate === true;

    this.getAccessToken(candidate.reportName, candidate.defaultPage ?? undefined);
  }



  private constructEmbedConfig(candidate: ReportCandidate, reportData: InsightsDashboardResponse) {
    if (!reportData) {
      console.error('No report data provided');
      return;
    }
       
    this.hiddenPages = candidate.hiddenPage ?? [];
    this.reportName = candidate.reportName;
    const { region, country } = this.insightDataSVC.resolvePageFilterConfig(candidate);

    let filters: models.ReportLevelFilters[] = [];

    const { db } = this.insightDataSVC.resolvePageFilterConfig(candidate);
    filters = db ? this.filterConfig(candidate, db, region, country) : [];

    const settings: IReportEmbedConfiguration['settings'] = {
      panes: {
        filters: { visible: false },
        pageNavigation: { visible: !reportData.embedUrl.includes('&pageName') }
      },
      background: models.BackgroundType.Default,
    };

    if (candidate.raiseHyperlinkClickEvent === true) {
      settings.hyperlinkClickBehavior = models.HyperlinkClickBehavior.RaiseEvent;
    }

    this.embedConfig = {
      type: 'report',
      id: reportData.reportId,
      embedUrl: reportData.embedUrl,
      accessToken: reportData.accessToken,
      tokenType: models.TokenType.Embed,
      filters: filters,
      settings,
    };

  }


  private filterConfig(candidate: ReportCandidate, db: string | string[], region: string | undefined, country: string | undefined): models.ReportLevelFilters[] {
    const userCountries = this.dataState.getUserCountries(ApplicationIdEnum.Insight);
    const mappedCountries = Helper.applyCountryCodeMap(userCountries, candidate.countryCodeMap);
    const userRegionPermission = {
      Region: this.dataState.getUserRegions(ApplicationIdEnum.Insight),
      Country: mappedCountries,
    };
     const dbs = Array.isArray(db) ? db : [db];
    return dbs.flatMap(dbName => this.insightDataSVC.getRegionPermissions(userRegionPermission, dbName, region, country));
  } 

  private getAccessToken(reportName: InsightReportName, page: string | undefined) {
    this.insightsSVC.getAccessToken(reportName, page)
    .pipe(
      finalize(() => this.routeLoaderSVC.closeDialog())
    )
    .subscribe({
      next: res => {       
        if (res) {
          this.reportFailed = false;
          this.constructEmbedConfig(
            this.candidates[this.activeTab],
            { ...res, embedUrl: page ? `${res.embedUrl}&pageName=${page}` : res.embedUrl }
          );
        } else {
          this.reportFailed = true;
          console.error('No response from getAccessToken');
        }
      },
      error: err => {
        this.reportFailed = true;
        console.error(`"${reportName}" in Insight dashboard service got failed with error message - ${err}.`);
      }
    });
  }

  onReportLoaded() {
    this.canEnableBulkUpdate = true;
    this.showValidationError = false;
  }

  clickEvent(url: string) {
    if (this.candidates[this.activeTab]?.isBulkUpdate !== true) {
      return;
    }

    const decodedURL = url.replaceAll('&amp;', '&');
    let parsedURL: URL;

    try {
      parsedURL = new URL(decodedURL, globalThis.location.origin);
    } catch {
      return;
    }

    const params = parsedURL.searchParams;
    const subId = params.get(FRAUD_ALERT_POPUP_INPUTS.SUB_ID) ?? '';
    const eventId = params.get(FRAUD_ALERT_POPUP_INPUTS.EVENT_ID) ?? '';
    const vendorId = params.get(FRAUD_ALERT_POPUP_INPUTS.VENDOR_ID) ?? '';
    const platform = params.get(FRAUD_ALERT_POPUP_INPUTS.PLATFORM) ?? '';
    const region = params.get(FRAUD_ALERT_POPUP_INPUTS.REGION) ?? '';
    const type = params.get(FRAUD_ALERT_POPUP_INPUTS.TYPE) ?? '';

    if (!subId && !eventId) {
      return;
    }

    this.popupSVC.showDialog({
      subId,
      eventId,
      region,
      vendorId: Number.parseInt(vendorId),
      platform,
      type
    });
  }

  resetAllFilters(event: string) {
    this.showValidationError = false;
    this.reportCommand$.next(event);
  }

  async OpenBulkUpdatePanel() {
    if (!this.powerBIWrapper) {
      return;
    }

    const isReportValid = await this.powerBIWrapper.getReportFilters();

    if (!isReportValid?.isAllowedUpdate) {
      this.validationErrorMsg = isReportValid?.message || 'Cannot open Bulk Update: report is empty or "Resolved" not selected.';
      this.showValidationError = true;
      this.canEnableBulkUpdate = false;

      setTimeout(() => {
        this.showValidationError = false;
        this.canEnableBulkUpdate = true;
      }, 6000);

      console.warn('Cannot open Bulk Update: report is empty or "Resolved" not selected.');
      return;
    }

    this.showValidationError = false;
    const filters = isReportValid.filters;

    this.sidePanelSVC.open(
      BulkupdateFraudeventPopupComponent,
      {
        disableClose: false,
        hasBackdrop: false,
        width: '75vw',
        position: 'right',
        data: filters,
        layoutMode: 'below-header',
        headerHeightPx: 68,
      },
    );
  }
}
