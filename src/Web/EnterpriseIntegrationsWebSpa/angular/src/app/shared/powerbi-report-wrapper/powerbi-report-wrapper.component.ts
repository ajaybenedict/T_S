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
} from '@angular/core';
import { IReportEmbedConfiguration, Report, models } from 'powerbi-client';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
// Ensure EventHandler is imported
import { EventHandler } from 'powerbi-client-angular/components/powerbi-embed/powerbi-embed.component';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-powerbi-report-wrapper',
  templateUrl: './powerbi-report-wrapper.component.html',
  styleUrls: ['./powerbi-report-wrapper.component.css']
})
export class PowerbiReportWrapperComponent implements OnInit, OnChanges, OnDestroy {

  @Input() embedConfig!: IReportEmbedConfiguration;
  @Input() reportCommand$!: BehaviorSubject<string>;
  @ViewChild('report', {static: false}) reportEle!: PowerBIReportEmbedComponent;
  @Output() hyperlinkClicked = new EventEmitter<string>();
  
  declare private reportCommandsubs: Subscription;
   
  eventHandlers: Map<string, EventHandler | null> = new Map();
  private report!: Report;

  get isConfigReady(): boolean {
    return !!this.embedConfig;
  }

  ngOnInit(): void {
    if(this.reportCommand$) {      
      this.reportCommandsubs = this.reportCommand$.subscribe({
        next: command => {
          if(command == 'ResetAll') {            
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

  setEventHandlers(): void {
    this.eventHandlers = new Map(
      [
        ['dataHyperlinkClicked', (event?: any, embeddedEntity?: any) => {
          const url = event?.detail?.data?.url ?? event?.detail?.url;          
          this.hyperlinkClicked.emit(url);
        }],
        ['error', (event?: any, embeddedEntity?: any) => {
          console.error('Power BI Error:', event);
        }],
        [
          'loaded', 
          async (event?: any, embeddedEntity?: any) => {
            this.report = await this.reportEle.getReport();            
          }
        ],
      ]);
  }

  // will be called directly from parent component
  async resetAllFilters(defaultFilters: models.ReportLevelFilters[] = []) {
    if(this.report) {     
      this.report.reload();
      if(defaultFilters?.length > 0) await this.report.setFilters(defaultFilters); // applying default filters.
    } else {
      console.warn('ResetAll: PowerBI report not yet loaded/available.');
    }
  }

  ngOnDestroy(): void {
    if(this.reportCommandsubs) this.reportCommandsubs.unsubscribe();
  }
}
