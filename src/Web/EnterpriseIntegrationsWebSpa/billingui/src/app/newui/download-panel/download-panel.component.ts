import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, OnDestroy, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { TabButton, SelectDropdown } from 'src/app/interface/button.interface';
import { DownloadReportService } from 'src/app/services/download-report.service';
import { DOWNLOAD_PANEL_TAB_OPTIONS } from 'src/app/config/download-panel-tab-options.config';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-download-panel',
  templateUrl: './download-panel.component.html',
  styleUrls: ['./download-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadPanelComponent implements AfterViewInit, OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  countryOptions: SelectDropdown[] = [
    { label: 'India', value: 'India' },
    { label: 'Belgium', value: 'Belgium' },
    { label: 'Denmark', value: 'Denmark' },
  ];


  vendorOptions: SelectDropdown[] = [
    { label: 'Amazon', value: 'Amazon' },
    { label: 'Google', value: 'Google' },
    { label: 'BitTitan', value: 'BitTitan' },
  ];

  headername = 'Download';
  isOpen$ = this.downloadReportService.isDownloadPanelOpen$;
  @Input() tabs: TabButton[] = [];
  tabOptions = DOWNLOAD_PANEL_TAB_OPTIONS;
  @ViewChild('positiveChargesTab', { static: false }) positiveChargesTab!: TemplateRef<any>;
  @ViewChild('negativeChargesTab', { static: false }) negativeChargesTab!: TemplateRef<any>;

  selectedTabTemplate: TemplateRef<any> | null = null;
  selectedTab: string = 'All';
  negativeChargesForm!: FormGroup;

  constructor(private readonly cdr: ChangeDetectorRef,
    private readonly downloadReportService: DownloadReportService,
    private readonly fb: FormBuilder) { }

  ngOnInit() {
    this.negativeChargesForm = this.fb.group({
      country: [[]],
      vendor: [[]]
    });
  }

  ngAfterViewInit() {
    this.selectedTabTemplate = this.positiveChargesTab;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  closePanel() {
    this.downloadReportService.close();
  }

  filterButtonChange(tabName: string) {
    this.selectedTab = tabName;
    if (tabName === 'All') {
      this.selectedTabTemplate = this.positiveChargesTab;
    } else if (tabName === 'Negative Charges') {
      this.selectedTabTemplate = this.negativeChargesTab;
    }
  }

  onDownload() {
    if (this.selectedTab === 'Negative Charges') {
      const selectedCountries = this.negativeChargesForm.get('country')?.value;
      const selectedVendors = this.negativeChargesForm.get('vendor')?.value;
      // placeholder for download logic
    } else {
      const selectedOptions = this.tabOptions.filter(option => option.checked);
            // placeholder for download logic
    }
  }



}
