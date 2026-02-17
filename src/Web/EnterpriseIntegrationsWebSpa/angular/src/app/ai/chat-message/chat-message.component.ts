import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash';
import { filter, Observable, of, Subscription } from 'rxjs';
import { DisplayEntity } from 'src/app/AIAssistant/models/display-entity';
import { API_V1, CORE_PATH_AI } from 'src/app/core/constants/constants';
import { AIDataService } from 'src/app/core/services/ai/ai-data.service';
import { AIThreadMessageService } from 'src/app/core/services/ai/ai-thread-message.service';
import { IonDataDiscoveryApiDataService } from 'src/app/core/services/AIAssistant/ion-data-discovery.service';
import { JsonHelper } from 'src/app/core/services/AIAssistant/json-helper';
import { DataState } from 'src/app/core/services/data-state';
import { Assistant, AssistantMessage, ToolCall, ToolCallDeltaChunk, ToolFunctionOutput } from 'src/app/models/ai/assistant.interface';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit, OnDestroy {
  message = "";
  messages: AssistantMessage[] = [];
  systemMessage = '';
  showLoader = false;
  isFunctionEvaluated = false;
  partialJson = '';
  chatInProgress = false;
  apiBaseUrl = `${this.dataState.getCoreBaseUrl()}/${CORE_PATH_AI}/${API_V1}/assistant`; // Core Path will be used only for Chat-Completions API
  gptChatWidth = '0px';
  leftOffset = '0px';

  declare assistant: Assistant;
  declare messageId: string;
  declare asstMessage: any;
  declare localMessages: any;
  declare localAsstMsg: any;
  declare assistantId: number;
  declare threadId: string | null;
  declare assistantSubs: Subscription;
  declare assistantIdSubs: Subscription;
  declare threadIdSubs: Subscription;
  declare messageSubs: Subscription;
  declare messageListSubs: Subscription;
  declare submitMessageSubs: Subscription;
  declare chatInProgressSubs: Subscription;

  constructor(
    private readonly threadMessageSVC: AIThreadMessageService,
    private readonly aiDataSVC: AIDataService,
    private readonly cdr: ChangeDetectorRef,
    private readonly apiDataSVC: IonDataDiscoveryApiDataService, // Need to use factort service in future
    private readonly dataState: DataState,
  ) { }

  ngOnInit(): void {
    this.calculateGPTWidth();    
    this.assistantIdSubs = this.aiDataSVC.assistantId$.subscribe({
      next: res => {
        if (res) {
          this.assistantId = res;
        }
      }
    });
    this.threadIdSubs = this.aiDataSVC.threadId$.subscribe({
      next: res => {
        if (res) {
          this.threadId = res;
        }
      }
    });
    this.assistantSubs = this.aiDataSVC.assistant$.subscribe({
      next: res => {
        if (res) {
          this.assistant = res;
        }
      }
    });
    this.messageSubs = this.aiDataSVC.message$.subscribe({
      next: res => {
        if(res) {
          this.message = res;
        }
      }
    });
    this.messageListSubs = this.aiDataSVC.messageList$.subscribe({
      next: res => this.messages = res
    });
    this.submitMessageSubs = this.aiDataSVC.submitMessage$.subscribe({
      next: res => {
        if(res) {          
          this.submitMessage();
        }
      }
    });
    this.chatInProgressSubs = this.aiDataSVC.chatInProgress$.subscribe({
      next: res => this.chatInProgress = res
    });
  }

  @HostListener('window:resize', ['$event'])
    onResize(event: any) {
      this.calculateGPTWidth();
    }

  calculateGPTWidth() {
    this.gptChatWidth = `${window.innerWidth - 440}px`;
  }

  submitMessage(): void {
    if (!this.message?.trim() || !this.validateRequest()) return;
    this.prepareForSubmission();
    this.pushUserMessage(this.message);
    if (!this.threadId) {
      console.log('submitMessage: ThreadId not defined!');
      return;
    }
    this.threadMessageSVC.createThreadMessage({ role: 'user', assistantId: this.assistantId, threadId: this.threadId, content: this.message }).subscribe();
    this.message = '';
    this.pushAssistantPlaceholder();
    this.doSendRequestToAi();
    this.aiDataSVC.setMessageList(this.messages);
  }

  validateRequest(): boolean {
    return true;
  }

  private prepareForSubmission(): void {
    this.scrollToBottom();
    this.systemMessage = '';
    this.showLoader = true;
    this.aiDataSVC.setChatInProgress(true);
    this.isFunctionEvaluated = false;
    this.messages = this.messages || [];
  }

  private pushUserMessage(message: string): void {
    this.asstMessage = {
      id: this.generateGUID(),
      role: 'user',
      content: [{ text: { value: message } }],
      isSubmitEnabled: false
    };
    this.messages.push(this.asstMessage);    
  }

  private pushAssistantPlaceholder(): void {
    this.asstMessage = {
      id: this.generateGUID(),
      role: 'assistant',
      content: [{ text: { value: '' } }]
    };
    this.messages.push(this.asstMessage);
    this.asstMessage.showLoader = of(true);
    this.cdr.detectChanges();    
    this.localMessages = cloneDeep(this.messages);
    this.localAsstMsg = cloneDeep(this.asstMessage);
  }

  doSendRequestToAi(): void {
    const aimessages = this.aiDataSVC.getOpenAiMessages(this.localMessages, this.assistant.instructions);
    const requestData = this.buildRequestData(aimessages);

    this.asstMessage.openAiResult = new Observable<string>(observer => {
      const subscription = this.doOpenAICall(requestData).subscribe({
        next: (chunk) => this.handleStreamChunk(chunk, observer),
        error: (err) =>  this.handleStreamError(err, observer),
        complete: () =>  this.handleStreamComplete(observer),
      });

      return () => {        
        subscription.unsubscribe();
      };
    }).pipe(
      filter((result: string) => !result.startsWith('```chartjson'))
    );
  }


  private buildRequestData(messages: any[]): any {
    return {
      model: 'gpt-4o',
      messages,
      tools: this.assistant.tools,
      max_tokens: 4000,
      n: 1,
      temperature: 0.2,
      stream: true,
      tool_choice: 'auto',
      parallel_tool_calls: false
    };
  }

  private handleStreamChunk(chunk: string, observer: any): void {
    if (!chunk || (this.isFunctionEvaluated && !this.apiDataSVC.isInlineAnalysis)) {
      observer.next(this.apiDataSVC.displayTitle);
      this.localAsstMsg.childStreamingData = this.apiDataSVC.displayTitle;
      this.saveLastMessage();
      observer.complete();
      return;
    }

    const newContent = this.parseAndUpdateToolCalls(chunk);
    this.localAsstMsg.childStreamingData ??= '';
    this.localAsstMsg.childStreamingData += newContent;
    observer.next(JsonHelper.removeJsonObject(this.localAsstMsg.childStreamingData));
  }

  private parseAndUpdateToolCalls(chunk: string): string {
    const updates = chunk.replace('data: [DONE]', '').split('data: ').filter(Boolean);
    let combinedContent = '';
    for (const update of updates) {
      try {
        this.partialJson += update;
        const parsed: ToolCallDeltaChunk = JSON.parse(this.partialJson);
        this.partialJson = '';

        const delta = parsed.choices[0].delta;
        if (delta?.tool_calls) {
          if (!this.localAsstMsg.tool_calls) {
            this.localAsstMsg.tool_calls = delta.tool_calls;
          } else if (delta.tool_calls[0].function?.arguments) {
            this.localAsstMsg.tool_calls[0].function.arguments += delta.tool_calls[0].function.arguments;
          }
        } else if (delta?.content) {
          combinedContent += delta.content;
        }
      } catch {
        // Continue accumulating JSON
      }
    }
    return combinedContent;
  }

  private handleStreamError(err: any, observer: any): void {
    console.error('Error occurred:', err);
    observer.error(err);
    this.asstMessage.showLoader = of(false);
    this.showLoader = false;
    this.aiDataSVC.setChatInProgress(false);
  }

  private handleStreamComplete(observer: any): void {    
    if (this.localAsstMsg.tool_calls?.length) {
      this.executeToolCalls(observer);
    } else if (this.localAsstMsg.childStreamingData) {
      this.saveLastMessage();
      observer.complete();
    } else {
      observer.complete();
    }
  }

  private executeToolCalls(observer: any): void {    
    const functions: any[] = [];
    const toolCallsCopy = JSON.parse(JSON.stringify(this.localAsstMsg.tool_calls)) as ToolCall[];

    for (const toolOutput of toolCallsCopy) {
      const functionName = toolOutput.function.name;
      let argumentParams: any;

      try {
        argumentParams = JSON.parse(toolOutput.function.arguments);
      } catch {
        this.systemMessage = 'Something went wrong. Try again with a different prompt.';
        this.showLoader = false;
        this.aiDataSVC.setChatInProgress(false);
        return;
      }

      this.apiDataSVC.getApiData(functionName, argumentParams, null).subscribe((dataResp) => {
        const func = this.constructFunctionOutput(functionName, argumentParams, dataResp);
        functions.push(func);

        this.processToolCallResult(toolOutput.id, functions);
        this.doSendRequestToAi();
      });
    }
  }

  private constructFunctionOutput(name: string, args: any, resp: any): any {
    try {
      if (resp.data && !resp.isError) this.isFunctionEvaluated = true;
      return { function: name, arguments: args, ...resp };
    } catch (e) {
      return { function: name, arguments: args, isError: true, error: 'Something went wrong.. ' + e, ...resp };
    }
  }

  private processToolCallResult(toolCallId: string, functions: any[]): void {
    this.processAiMessage(this.asstMessage, functions);

    this.localAsstMsg.content[0].text.value = null;
    this.localMessages.push(cloneDeep(this.localAsstMsg));

    this.localAsstMsg.content[0].text.value = '```json' + JSON.stringify(functions) + '```';
    this.asstMessage.content[0].text.value = this.localAsstMsg.content[0].text.value;

    this.localAsstMsg.tool_calls = null;
    this.localAsstMsg.role = 'tool';
    this.localAsstMsg.tool_call_id = toolCallId;
    this.localMessages.push(cloneDeep(this.localAsstMsg));
  }

  saveLastMessage(): void {
    this.asstMessage.content[0].text.value = this.localAsstMsg.childStreamingData + ' ' + this.asstMessage.content[0].text.value;
    this.asstMessage.showLoader = of(false);
    this.showLoader = false;
    this.aiDataSVC.setChatInProgress(false);
    if (!this.threadId) {
      console.log('saveLastMessage: ThreadId not defined!');
      return;
    }
    this.threadMessageSVC.createThreadMessage({ assistantId: this.assistantId, threadId: this.threadId, role: 'assistant', content: this.asstMessage.content[0].text.value }).subscribe();
    this.aiDataSVC.setMessageList(this.messages);
  }

  doOpenAICall1(data: any): Observable<string> {    
    return new Observable<string>((observer: any) => {
      const url = `${this.apiBaseUrl}/chat-completions`;
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })
        .then(response => {          
          const reader = response.body?.getReader();
          const decoder = new TextDecoder('utf-8');
          const readStream = () => {
            reader?.read().then(({ done, value }) => {
              if (done) {
                observer.next();
                observer.complete();
                return;
              }
              const chunk = decoder.decode(value, { stream: true });
              observer.next(chunk);
              readStream();
            }).catch(err => observer.error(err));
          };
          readStream();
        })
        .catch(err => observer.error(err));

      return () => observer.complete();
    });
  }

  doOpenAICall(data: any): Observable<string> {
    return new Observable<string>((observer: any) => {
      const url = `${this.apiBaseUrl}/chat-completions`;

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder('utf-8');

          const readStream = () => {
            reader?.read().then(({ done, value }) => {
              if (done) {                
                observer.complete(); //MUST call this
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              observer.next(chunk); // Emit partial chunk
              readStream();         // Continue reading
            }).catch(err => {
              console.error('Error while reading stream:', err);
              observer.error(err);
            });
          };

          readStream(); // Start streaming

        })
        .catch(err => {
          console.error('Fetch failed:', err);
          observer.error(err);
        });

      return () => {        
        observer.complete();
      };
    });
  }


  processAiMessage(item: AssistantMessage, outputData: ToolFunctionOutput[]): void {
    item.components = [];

    if (item.role !== "assistant" || !outputData) return;


    let isData = false;
    let isError = false;

    outputData.forEach((func: ToolFunctionOutput) => {
      const hasData = Array.isArray(func.data) && func.data.length > 0;
      if (hasData) {
        isData = true;
        item.isData = true;

        const displayEntity: DisplayEntity | null =
          this.apiDataSVC.getDisplayComponent(func.function, func.arguments);

        if (displayEntity) {
          const component = {
            outputComponent: displayEntity.displayComponent,
            compInputs: {
              apiDataService: this.apiDataSVC,
              assistantService: this.aiDataSVC,
              configuration: displayEntity.configuration,
              dataSource: func.data,
              pagination: func.pagination,
              function: func.function,
              arguments: func.arguments,
              threadId: this.threadId ?? undefined,
              messageId: item.id
            },
            compOutputs: null,
          };
          item.components?.push(component);
        }
      }

      if (func.isError) isError = true;
    });

    if (!isData) {
      item.content[0].response = isError
        ? "There was an error processing your request."
        : "Your prompt did not return any results. Please try a different prompt.";
    }

    this.messageId = item.id;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.chat-content-area');
      if (container) container.scrollTop = container.scrollHeight;
    }, 0);
  }

  private generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  ngOnDestroy(): void {
    if (this.assistantIdSubs) this.assistantIdSubs.unsubscribe();
    if (this.assistantSubs) this.assistantSubs.unsubscribe();
    if (this.threadIdSubs) this.threadIdSubs.unsubscribe();
    if (this.messageSubs) this.messageSubs.unsubscribe();
    if (this.messageListSubs) this.messageListSubs.unsubscribe();
    if (this.submitMessageSubs) this.submitMessageSubs.unsubscribe();
    if (this.chatInProgressSubs) this.chatInProgressSubs.unsubscribe();
    // Clear variables
    this.message = "";
    this.messages = [];
    this.systemMessage = '';
    this.showLoader = false;
    this.isFunctionEvaluated = false;
    this.partialJson = '';
    this.chatInProgress = false;
  }
}
