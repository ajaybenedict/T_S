import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AISummaryService } from '../core/services/ai/ai-summary.service';
import { AIAssistantService } from '../core/services/ai/ai-assistant.service';
import { catchError, concatMap, of, take } from 'rxjs';
import { AI_OVERVIEW_DISCLAIMER_TEXT, C3_AI_SUMMARY_ASSISTANT_ID } from '../core/constants/constants';

@Component({
  selector: 'app-ai-summary',
  templateUrl: './ai-summary.component.html',
  styleUrls: ['./ai-summary.component.css']
})
export class AiSummaryComponent implements OnInit{

  isPanelMinimized = false;
  showProgressbar = true;
  summaryResponse!: string;
  disclaimerText = AI_OVERVIEW_DISCLAIMER_TEXT;
  
  @Input() assistantId: number = C3_AI_SUMMARY_ASSISTANT_ID; //fall backs to 2
  @Input() jsonData!: string;

  @Output() panelClosed = new EventEmitter<void>();
  @Output() panelMinimized = new EventEmitter<void>();

  constructor(
    private readonly assistantSVC: AIAssistantService,
    private readonly summaryService: AISummaryService,
  ) {}

  ngOnInit(): void {    
    if(!this.jsonData) {
      console.error(`No JSON data received from pa.`);
      return;
    }
    this.assistantSVC.getAssistant(this.assistantId).pipe(
      take(1),
      catchError(err => {
        console.log(`Error in getting assistant: ${err}`); 
        this.showProgressbar = false;
        this.summaryResponse = `<span class="s1-C-Cherry">Failed to load data from server. Error - ${err}<span>`  // We are passing this html data to <markdown>
        return of(null);
      }),
      concatMap(res => {
        if(res) {
          return this.summaryService.getSummary(res.instructions, this.jsonData)
        } else {
          return of(null)
        }
      })
    ).subscribe({
      next: res => {
        if(res) {
          this.summaryResponse = res;
          this.showProgressbar = false;
        }
      },
      error: err => {
        console.log(`Error in Chat Completion: ${err}`);
        this.showProgressbar = false;
        this.summaryResponse = `<span class="s1-C-Cherry">Failed to load data from server. Error: ${err}</span>` // We are passing this html data to <markdown>
      }
    });
  }

  toggleArrowBtn() {
    this.isPanelMinimized = !this.isPanelMinimized;
    this.emitPanelMinimized();
  }

  dismissBtnHandler() {
    this.emitPanelClosed();
  }

  emitPanelClosed() {
    this.panelClosed.emit();
  }

  emitPanelMinimized() {
    this.panelMinimized.emit();
  }

}
