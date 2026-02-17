import { Component,  Input } from '@angular/core';
import { Pagination } from '../models/api-data-response'
import { Configuration } from '../models/display-entity';
import { AssistantService } from '../../core/services/AIAssistant/assistant-service';
import { ApiDataService } from '../../core/services/AIAssistant/api-data-service';
@Component({
  template: ``

})
export class BaseDisplayComponent {

  @Input() apiDataService: ApiDataService | undefined;

  @Input() assistantService: AssistantService | undefined;

  @Input() dataSource: any = [];
  @Input() function: any;
  @Input() arguments: any;
  @Input() configuration: Configuration | undefined;
  @Input() pagination: Pagination | undefined;
  @Input() threadId: any;
  @Input() runId: any;
  @Input() messageId: any;
  @Input() toolOutputId: any;
  @Input() childData: any;
  @Input() assistant: any;


}

