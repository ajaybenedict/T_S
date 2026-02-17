import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IReportEmbedConfiguration, models } from 'powerbi-client';
import { BehaviorSubject } from 'rxjs';
import { insightActionBarConfig, InsightReportName, ReportCandidate } from 'src/app/core/config/insight-dashboard.config';
import { INSIGHT_DASHBOARD_ROUTE } from 'src/app/core/constants/constants';
import { PermissionsLoaderDialogService } from 'src/app/core/services/permissions-loader-dialog.service';
import { InsightResolverResponse, InsightsDashboardResponse } from 'src/app/models/insights/insights-dashboard-api-response.interface';
import { S1ActionBar } from 'src/app/models/s1/s1-action-bar.interface';

@Component({
  selector: 'app-exchange-rate',
  templateUrl: './exchange-rate.component.html',
  styleUrls: ['./exchange-rate.component.css'],
})
export class ExchangeRateComponent implements OnInit {  
  
  embedConfig: IReportEmbedConfiguration | null = null;
  declare actionbarData: S1ActionBar;
  reportCommand$ = new BehaviorSubject<string>('');

  private candidates: ReportCandidate[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly routeLoaderSVC: PermissionsLoaderDialogService,
  ) { }

  ngOnInit() {   
    this.actionbarData = {...insightActionBarConfig}; 
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
    if (reportData) {
      this.embedConfig = {
        type: 'report',
        id: reportData.reportId,
        embedUrl: reportData.embedUrl,
        accessToken: reportData.accessToken,
        tokenType: models.TokenType.Embed,
        settings: {
          panes: {
            filters: {
              visible: false
            },
            pageNavigation: {
              visible: !reportData.embedUrl.includes('&pageName'),
            }
          },          
          background: models.BackgroundType.Default,
        }
      };
    }
  }

  resetAllFilters(event: string) {
    this.reportCommand$.next(event);
  }
}
