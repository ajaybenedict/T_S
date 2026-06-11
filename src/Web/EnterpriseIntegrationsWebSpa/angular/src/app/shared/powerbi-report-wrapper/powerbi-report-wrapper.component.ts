import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { IReportEmbedConfiguration, Report, models } from 'powerbi-client';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
import { EventHandler } from 'powerbi-client-angular/components/powerbi-embed/powerbi-embed.component';
import { BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';
import { BULK_UPDATE_FRAUD_EVENT_MESSAGES, BULK_UPDATE_FRAUD_EVENT_OPERATOR, BULK_UPDATE_TABLE, BULK_UPDATE_COLUMN } from 'src/app/core/constants/constants';
import { InsightsDashboardApiService } from 'src/app/core/services/insights/insights-dashboard-api.service';

@Component({
  selector: 'app-powerbi-report-wrapper',
  templateUrl: './powerbi-report-wrapper.component.html',
  styleUrls: ['./powerbi-report-wrapper.component.css']
})
export class PowerbiReportWrapperComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() embedConfig!: IReportEmbedConfiguration;
  @Input() reportCommand$!: BehaviorSubject<string>;
  @Input() reportName!: string; // New input for report name
  @Input() hiddenPages: string[] = [];
  @ViewChild('report', { static: false }) reportEle!: PowerBIReportEmbedComponent;
  @Output() hyperlinkClicked = new EventEmitter<string>();
  @Output() loaded = new EventEmitter<void>();

  private reportCommandsubs?: Subscription;
  private tokenRefreshTimer?: any;
  private report?: Report;
  private currentReportId?: string;

  eventHandlers: Map<string, EventHandler | null> = new Map();

  constructor(private readonly insightsSVC: InsightsDashboardApiService) { }

  get isConfigReady(): boolean {
    return !!this.embedConfig;
  }

  ngOnInit(): void {
    if (this.reportCommand$) {
      this.reportCommandsubs = this.reportCommand$.subscribe({
        next: command => {
          if (command == 'ResetAll') {
            this.resetAllFilters();
          }
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isConfigReady) return;
    this.setEventHandlers();
  }

  ngAfterViewInit(): void {
    if (!this.embedConfig?.accessToken) return;
    this.currentReportId = this.embedConfig.id as string;
    this.scheduleTokenRefresh(this.embedConfig.accessToken);
  }

  setEventHandlers(): void {
    this.eventHandlers = new Map(
      [
        ['dataHyperlinkClicked', (event?: any, embeddedEntity?: any) => {
          const url = event?.detail?.data?.url ?? event?.detail?.url;
          this.hyperlinkClicked.emit(url);
        }],
        ['error', async (event?: any, embeddedEntity?: any) => {
          console.error('Power BI Error:', event);
          const error = event?.detail;
          const message = (error?.message || '').toLowerCase();
          const isTokenExpired = message.includes('tokenexpired');

          if (isTokenExpired) {
            await this.handleTokenExpired();
          }
        }],       
        [
          'loaded',
          async (event?: any, embeddedEntity?: any) => {
            this.report = await this.reportEle.getReport();
            if (this.hiddenPages?.length > 0) {
              const pages = await this.report.getPages();
              for (const page of pages) {
                if (this.hiddenPages.includes(page.name)) {
                  await this.report.deletePage(page.name);
                }
              }
            }
          }
        ],
        ['rendered', async () => {
          this.loaded.emit();
        }]
      ]);
  }

  private scheduleTokenRefresh(accessToken?: string): void {
    if (!accessToken) return;

    // Clear existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    // Extract expiration from token
    const expiresOn = this.extractTokenExpiration(accessToken);

    if (expiresOn) {
      // Refresh 5 minutes before expiration
      const refreshBeforeExpiry = 5 * 60 * 1000; // 5 minutes in ms
      const now = Date.now();
      const expiryTime = new Date(expiresOn).getTime();
      const timeUntilRefresh = expiryTime - now - refreshBeforeExpiry;

      if (timeUntilRefresh > 0) {       
        this.tokenRefreshTimer = setTimeout(() => {
          this.refreshToken();
        }, timeUntilRefresh);
      } else {        
        this.refreshToken();
      }
    }
  }

  private extractTokenExpiration(accessToken: string): Date | null {
    try {
      const parts = accessToken.split('.');
      if (parts.length < 2) return null;

      const metadataJson = this.decodeJwtPayload(parts[1]);
      if (!metadataJson) return null;

      const jsonDoc = JSON.parse(metadataJson);

      if (jsonDoc.exp) {
        return new Date(jsonDoc.exp * 1000);
      }
    } catch (error) {
      console.error('Error extracting token expiration:', error);
    }

    return null;
  }

  private decodeJwtPayload(payload: string): string | null {
    try {
      const normalized = payload.replaceAll('-', '+').replaceAll('_', '/');
      const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
      return atob(normalized + padding);
    } catch {
      return null;
    }
  }

  private async refreshToken(): Promise<void> {

    if (!this.currentReportId || !this.reportName) {
      console.error('Cannot refresh token: missing reportId or reportName');
      return;
    }

    try {
      const response = await firstValueFrom(
        this.insightsSVC.getAccessToken(
          this.reportName,
          this.currentReportId
        )
      );

      if (response && this.report) {
        await this.report.setAccessToken(response.accessToken);
        this.scheduleTokenRefresh(response.accessToken);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  private async handleTokenExpired(): Promise<void> {
    // Fallback handler when token expires before scheduled refresh
    await this.refreshToken();
  }

  async resetAllFilters(defaultFilters: models.ReportLevelFilters[] = []) {
    if (this.report) {
      this.report.reload();
      if (defaultFilters?.length > 0) await this.report.setFilters(defaultFilters);
    } else {
      console.warn('ResetAll: PowerBI report not yet loaded/available.');
    }
  }

  async getReportFilters(): Promise<{ isAllowedUpdate: boolean; filters?: any; message: string } | null> {
    const report = await this.getReportSafe();
    if (!report) return { isAllowedUpdate: false, message: BULK_UPDATE_FRAUD_EVENT_MESSAGES.REPORT_LOADING };

    this.ensureReportIframeBound();

    const activePage = await report.getActivePage();
    const visuals = await activePage.getVisuals();
    // Get slicer values
    const values = await this.getEventStatusValues(visuals);

    if (!values?.length) return { isAllowedUpdate: false, message: BULK_UPDATE_FRAUD_EVENT_MESSAGES.NO_STATUS_SELECTED };

    if (values.length > 1) return { isAllowedUpdate: false, message: BULK_UPDATE_FRAUD_EVENT_MESSAGES.MORE_THAN_ONE_STATUS_SELECTED };

    if (values.some(v => v?.toLowerCase?.() === 'resolved')) {
      return { isAllowedUpdate: false, message: BULK_UPDATE_FRAUD_EVENT_MESSAGES.RESOLVED_STATUS_SELECTED };
    }

    const count = await this.getEventCount(visuals);

    if (!count) return { isAllowedUpdate: false, message: BULK_UPDATE_FRAUD_EVENT_MESSAGES.NO_EVENTS_IN_THE_GRID };

    const reportFilters = report.getFilters();
    const pageFilters = activePage.getFilters();
    const slicerFilters = await this.extractSlicerFilters(visuals);

    return {
      isAllowedUpdate: true,
      message: BULK_UPDATE_FRAUD_EVENT_MESSAGES.PRECHECK_SUCCESS_MESSAGE,
      filters: {
        reportFilters,
        slicerFilters,
        activePage: {
          name: activePage.name,
          displayName: activePage.displayName,
          filters: pageFilters
        }

      }
    }
  }

  private async extractSlicerFilters(visuals: any[]): Promise<any[]> {
    const slicers = visuals.filter(v => v.type === 'slicer');

    const filterPromises = slicers.map(async (slicer) => {
      try {
        const state = await slicer.getSlicerState();
        const filter = state?.filters?.[0];

        if (!filter) return null;

        // 1. If it's a "NotIn" operator, convert it to "In"
        if (filter.operator === BULK_UPDATE_FRAUD_EVENT_OPERATOR.NOTIN) {
          const result = await slicer.exportData();
          const allValues = await this.getExportedValues(result);
          const excludedSet = new Set(filter.values.map(String));
          const includedValues = allValues.filter(v => !excludedSet.has(v));

          return this.buildInFilter(filter, includedValues);
        }

        return filter;

      } catch (err) {
        console.error(`Error processing slicer ${slicer.name}:`, err);
        return null;
      }
    });

    const results = await Promise.all(filterPromises);
    return results.filter(f => f !== null);
  }

  private async getExportedValues(result: any): Promise<string[]> {
    if (!result?.data) {
      return [];
    }

    return result.data
      .split(/\r?\n/)
      .slice(1)
      .map((row: string) => row.replace(/^"(.*)"$/, '$1').trim())
      .filter((row: string) => row.length > 0);
  }

  private buildInFilter(filter: any, values: string[]): any {
    return {
      $schema: 'https://powerbi.com',
      filterType: 1,
      operator: BULK_UPDATE_FRAUD_EVENT_OPERATOR.IN,
      target: filter.target,
      values,
      requireSingleSelection: filter.requireSingleSelection || false
    };
  }

  private ensureReportIframeBound(): void {
    if (!this.report?.iframe?.contentWindow) {
      const iframe = this.findPowerBiIframe();
      if (iframe && this.report) this.report.iframe = iframe;
    }
  }

  private findPowerBiIframe(): HTMLIFrameElement | null {
    const iframes = Array.from(
      document.querySelectorAll<HTMLIFrameElement>('iframe[src*="powerbi.com"]')
    );

    for (const iframe of iframes) {
      if (iframe.isConnected && iframe.contentWindow) {
        return iframe;
      }
    }

    return iframes.find(i => i.isConnected) ?? null;
  }

  private async getReportSafe(): Promise<Report | null> {
    if (this.report) return this.report;

    try {
      this.report = await this.reportEle?.getReport();
      return this.report;
    } catch {
      console.error('PowerBI: unable to get report');
      return null;
    }
  }

  private async getEventStatusValues(visuals: any[]): Promise<string[] | null> {
    const slicers = visuals.filter(v => v.type === 'slicer');

    for (const slicer of slicers) {
      try {
        const filters = await this.getSlicerFilters(slicer);
        if (!filters?.length) continue;

        for (const filter of filters) {
          if (this.isTargetEventStatusFilter(filter)) {
            const values = await this.extractFilterValues(slicer, filter);
            if (values) return values;
          }
        }
      } catch (err) {
        console.error('Error reading Event Status slicer:', err);
        return null;
      }
    }

    return null;
  }

  private async getSlicerFilters(slicer: any): Promise<any[] | null> {
    const state = await slicer.getSlicerState();
    return state?.filters ?? null;
  }

  private isTargetEventStatusFilter(filter: any): boolean {
    const target = filter?.target;
    return target?.table === BULK_UPDATE_TABLE && target?.column === BULK_UPDATE_COLUMN;
  }

  private async extractFilterValues(slicer: any, filter: any): Promise<string[] | null> {
    if (filter.operator === BULK_UPDATE_FRAUD_EVENT_OPERATOR.IN) {
      return filter.values?.map(String) ?? [];
    }

    if (filter.operator === BULK_UPDATE_FRAUD_EVENT_OPERATOR.NOTIN) {
      return await this.extractExcludedFilterValues(slicer, filter);
    }

    return null;
  }

  private async extractExcludedFilterValues(slicer: any, filter: any): Promise<string[]> {
    const result = await slicer.exportData();
    const allValues = await this.getExportedValues(result);
    const excludedSet = new Set(filter.values.map(String));
    return allValues.filter(v => !excludedSet.has(v));
  }

  private async getEventCount(visuals: any[]): Promise<number> {
    const card = visuals.find(v => v.title === 'Event Count');

    if (!card?.exportData) return 0;

    try {
      const result = await card.exportData(models.ExportDataType.Summarized, 1);
      const match = result?.data?.match(/\d+/);
      return match ? Number.parseInt(match[0], 10) : 0;
    } catch {
      return 0;
    }
  }

  ngOnDestroy(): void {
    if (this.reportCommandsubs) this.reportCommandsubs.unsubscribe();
    if (this.tokenRefreshTimer) clearTimeout(this.tokenRefreshTimer);
  }
}
