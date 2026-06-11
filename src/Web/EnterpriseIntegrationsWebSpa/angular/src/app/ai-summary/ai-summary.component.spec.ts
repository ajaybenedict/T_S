import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ApplicationIdEnum } from '../core/config/permissions.config';
import { AIAssistantService } from '../core/services/ai/ai-assistant.service';
import { AISummaryService } from '../core/services/ai/ai-summary.service';

import { AiSummaryComponent } from './ai-summary.component';

describe('AiSummaryComponent', () => {
  let component: AiSummaryComponent;
  let fixture: ComponentFixture<AiSummaryComponent>;
  let assistantSvcSpy: jasmine.SpyObj<AIAssistantService>;
  let summarySvcSpy: jasmine.SpyObj<AISummaryService>;

  beforeEach(async () => {
    assistantSvcSpy = jasmine.createSpyObj<AIAssistantService>('AIAssistantService', ['getAssistant']);
    summarySvcSpy = jasmine.createSpyObj<AISummaryService>('AISummaryService', ['getSummary']);

    assistantSvcSpy.getAssistant.and.returnValue(of({
      id: '1',
      instructions: 'test instructions',
      prompts: [],
      tools: [],
      model: 'gpt-4o'
    } as any));
    summarySvcSpy.getSummary.and.returnValue(of('summary text'));

    await TestBed.configureTestingModule({
      declarations: [ AiSummaryComponent ],
      providers: [
        { provide: AIAssistantService, useValue: assistantSvcSpy },
        { provide: AISummaryService, useValue: summarySvcSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.jsonData = '{"key":"value"}';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call getAssistant with assistantId and applicationId inputs', () => {
    component.assistantId = 7;
    component.applicationId = ApplicationIdEnum.Insight;
    component.jsonData = '{"k":"v"}';

    component.ngOnInit();

    expect(assistantSvcSpy.getAssistant).toHaveBeenCalledWith(7, ApplicationIdEnum.Insight);
    expect(summarySvcSpy.getSummary).toHaveBeenCalledWith('test instructions', '{"k":"v"}');
  });

  it('should use default C3 applicationId when applicationId input is not provided', () => {
    component.assistantId = 2;
    component.jsonData = '{"k":"v"}';

    component.ngOnInit();

    expect(assistantSvcSpy.getAssistant).toHaveBeenCalledWith(2, ApplicationIdEnum.C3);
  });
});
