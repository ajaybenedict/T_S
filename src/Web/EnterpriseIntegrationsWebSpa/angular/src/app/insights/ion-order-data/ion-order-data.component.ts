import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IReportEmbedConfiguration, models } from 'powerbi-client';
import { BehaviorSubject } from 'rxjs';
import { insightActionBarConfig, InsightReportName, ReportCandidate } from 'src/app/core/config/insight-dashboard.config';
import { INSIGHT_DASHBOARD_ROUTE } from 'src/app/core/constants/constants';
import { DataState } from 'src/app/core/services/data-state';
import { InsightDataService } from 'src/app/core/services/insights/insight-data.service';
import { PermissionsLoaderDialogService } from 'src/app/core/services/permissions-loader-dialog.service';
import { InsightResolverResponse, InsightsDashboardResponse } from 'src/app/models/insights/insights-dashboard-api-response.interface';
import { S1ActionBar } from 'src/app/models/s1/s1-action-bar.interface';

@Component({
  selector: 'app-ion-order-data',
  templateUrl: './ion-order-data.component.html',
  styleUrls: ['./ion-order-data.component.css']
})
export class IonOrderDataComponent implements OnInit{
embedConfig: IReportEmbedConfiguration | null = null;
  reportCommand$ = new BehaviorSubject<string>('');
  declare actionbarData: S1ActionBar;

  private candidates: ReportCandidate[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly routeLoaderSVC: PermissionsLoaderDialogService,
    private readonly insightDataSVC: InsightDataService,
    private readonly dataState: DataState,
  ) { }

  ngOnInit() {
    this.actionbarData = { ...insightActionBarConfig };
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
          embedUrl: `${reportData.embedUrl}${pageParam}`
        }
      );
    }
    this.routeLoaderSVC.closeDialog();
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
        background: models.BackgroundType.Default,
      }
    };
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

