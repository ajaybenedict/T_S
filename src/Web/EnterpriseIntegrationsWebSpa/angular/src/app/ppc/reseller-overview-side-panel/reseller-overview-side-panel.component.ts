import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  ResellerOverviewPanel,
  ResellerOverviewPanelFields,
  ResellerOverviewPanelMockData,
  ResellerOverviewPanelTitles,
  ResellerOverviewSidePanelData,
  ResellerOverviewValueKeyConfig,
} from 'src/app/models/ppc/reseller-overview-panel.interface';
import { S1TagType } from 'src/app/models/s1/s1-tag.interface';
import { SidePanelRef } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.ref';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.tokens';

interface PanelRowViewModel {
  label: string;
  value: string;
  isTag: boolean;
  tagColor: S1TagType;
}

interface PanelSectionViewModel {
  title: string;
  rows: PanelRowViewModel[];
}

@Component({
  selector: 'app-reseller-overview-side-panel',
  templateUrl: './reseller-overview-side-panel.component.html',
  styleUrls: ['./reseller-overview-side-panel.component.css']
})
export class ResellerOverviewSidePanelComponent implements OnInit, OnChanges {
  @Input() resellerOverview?: ResellerOverviewPanel;

  activeResellerOverview: ResellerOverviewPanel = ResellerOverviewPanelMockData;
  sections: PanelSectionViewModel[] = [];
  headerTags: ReadonlyArray<{ value: string; color: S1TagType }> = [];

  constructor(
    @Inject(SIDE_PANEL_REF) private readonly panelRef: SidePanelRef<ResellerOverviewSidePanelData>,
    @Inject(SIDE_PANEL_DATA) private readonly panelData: ResellerOverviewSidePanelData,
  ) { }

  ngOnInit(): void {
    this.refreshViewModel();
  }

  ngOnChanges(_: SimpleChanges): void {
    this.refreshViewModel();
  }

  closeHandler(): void {
    this.panelRef.close();
  }

  trackByTitle(_: number, section: PanelSectionViewModel): string {
    return section.title;
  }

  trackByLabel(_: number, row: PanelRowViewModel): string {
    return row.label;
  }

  trackByValue(_: number, tag: { value: string; color: S1TagType }): string {
    return `${tag.value}-${tag.color}`;
  }

  private refreshViewModel(): void {
    this.activeResellerOverview = this.resolveResellerOverviewData();
    this.sections = [
      this.buildSection(
        ResellerOverviewPanelTitles.creditInfo,
        this.activeResellerOverview.creditInfo,
        ResellerOverviewPanelFields.creditInfo,
      ),
      this.buildSection(
        ResellerOverviewPanelTitles.riskInsurance,
        this.activeResellerOverview.riskInsurance,
        ResellerOverviewPanelFields.riskInsurance,
      ),
      this.buildSection(
        ResellerOverviewPanelTitles.paymentDunning,
        this.activeResellerOverview.paymentDunning,
        ResellerOverviewPanelFields.paymentDunning,
      ),
    ];

    this.headerTags = this.buildHeaderTags(this.activeResellerOverview);
  }

  private resolveResellerOverviewData(): ResellerOverviewPanel {
    return this.resellerOverview
      ?? this.panelData?.resellerOverview
      ?? ResellerOverviewPanelMockData;
  }

  private buildSection<T extends object>(
    sectionTitle: { title: string; subtitles: readonly string[] },
    sectionData: T,
    config: ReadonlyArray<ResellerOverviewValueKeyConfig<T>>,
  ): PanelSectionViewModel {
    const rows = config.map((configItem, index) => this.buildRow(
      sectionTitle.subtitles[index] ?? '--',
      configItem.valueKey,
      sectionData[configItem.valueKey],
      configItem.tagTypeKey ? sectionData[configItem.tagTypeKey] : undefined,
    ));

    return {
      title: sectionTitle.title,
      rows,
    };
  }

  private buildRow(label: string, valueKey: PropertyKey, value: unknown, tagTypeCandidate: unknown): PanelRowViewModel {
    const resolvedTagType = this.toTagType(tagTypeCandidate);

    return {
      label,
      value: this.formatDisplayValue(valueKey, value),
      isTag: resolvedTagType !== null,
      tagColor: resolvedTagType ?? 'Teal',
    };
  }

  private buildHeaderTags(data: ResellerOverviewPanel): ReadonlyArray<{ value: string; color: S1TagType }> {
    const candidateTags = [
      {
        value: data.riskInsurance.riskClassValue,
        color: data.riskInsurance.riskClassType,
      },
      {
        value: data.riskInsurance.allianzGradeValue,
        color: data.riskInsurance.allianzGradeType,
      },
      {
        value: data.paymentDunning.dunningLevelValue,
        color: data.paymentDunning.dunningLevelType,
      },
    ];

    return candidateTags.filter(tag => tag.value.trim().length > 0);
  }

  private formatDisplayValue(valueKey: PropertyKey, value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '--';
    }

    if (valueKey === 'nextReviewDate') {
      return this.formatNextReviewDate(value);
    }

    if (typeof value === 'number') {
      return value.toLocaleString('en-US');
    }

    return this.formatFallbackValue(value);
  }

  private formatNextReviewDate(value: unknown): string {
    if (typeof value !== 'string') {
      return this.formatFallbackValue(value);
    }

    const parsedDate = this.parseDate(value);
    if (!parsedDate) {
      return value;
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const day = parsedDate.getDate();
    const month = monthNames[parsedDate.getMonth()];
    const year = parsedDate.getFullYear();

    return `${day}${this.getOrdinalSuffix(day)} ${month}, ${year}`;
  }

  private parseDate(value: string): Date | null {
    const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (isoDateMatch) {
      const year = Number(isoDateMatch[1]);
      const monthIndex = Number(isoDateMatch[2]) - 1;
      const day = Number(isoDateMatch[3]);
      const candidate = new Date(year, monthIndex, day);

      if (
        candidate.getFullYear() === year
        && candidate.getMonth() === monthIndex
        && candidate.getDate() === day
      ) {
        return candidate;
      }

      return null;
    }

    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  private formatFallbackValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'boolean' || typeof value === 'bigint' || typeof value === 'symbol') {
      return value.toString();
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? '--' : value.toISOString();
    }

    if (typeof value === 'object' && value !== null) {
      try {
        return JSON.stringify(value);
      } catch {
        return '[Unserializable Object]';
      }
    }

    return '--';
  }

  private getOrdinalSuffix(day: number): string {
    const lastTwo = day % 100;
    if (lastTwo >= 11 && lastTwo <= 13) {
      return 'th';
    }

    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  private toTagType(value: unknown): S1TagType | null {
    if (value === 'Teal' || value === 'Cherry' || value === 'Sunset') {
      return value;
    }

    return null;
  }
}
