import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash';
import { filter, Observable, of, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { API_V1, CORE_PATH_AI } from 'src/app/core/constants/constants';
import { AIDataService } from 'src/app/core/services/ai/ai-data.service';
import { processAssistantToolOutputs } from 'src/app/core/services/ai/ai-message-renderer.helper';
import { AIThreadMessageService } from 'src/app/core/services/ai/ai-thread-message.service';
import { IonDataDiscoveryApiDataService } from 'src/app/core/services/AIAssistant/ion-data-discovery.service';
import { JsonHelper } from 'src/app/core/services/AIAssistant/json-helper';
import { DataState } from 'src/app/core/services/data-state';
import { Assistant, AssistantMessage, ToolCall, ToolCallDeltaChunk, ToolFunctionOutput } from 'src/app/models/ai/assistant.interface';
import { RemoveFileReferencesPipe } from '../../pipe/remove-file-references.pipe';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit, OnDestroy {
  private static readonly HUB_ASSISTANT_ID = 3;
  private readonly removeFileReferencesPipe = new RemoveFileReferencesPipe();

  message = "";
  messages: AssistantMessage[] = [];
  systemMessage = '';
  showLoader = false;
  isFunctionEvaluated = false;
  partialJson = '';
  chatInProgress = false;
  apiBaseUrl = `${this.dataState.getCoreBaseUrl()}/${CORE_PATH_AI}/${API_V1}/assistant`;
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
    private readonly apiDataSVC: IonDataDiscoveryApiDataService,
    private readonly dataState: DataState,
  ) { }

  ngOnInit(): void {
    this.calculateGPTWidth();
    this.assistantIdSubs = this.aiDataSVC.assistantId$.subscribe({ next: res => { if (res) this.assistantId = res; } });
    this.threadIdSubs = this.aiDataSVC.threadId$.subscribe({ next: res => { if (res) this.threadId = res; } });
    this.assistantSubs = this.aiDataSVC.assistant$.subscribe({ next: res => { if (res) this.assistant = res; } });
    this.messageSubs = this.aiDataSVC.message$.subscribe({ next: res => { if (res) this.message = res; } });
    this.messageListSubs = this.aiDataSVC.messageList$.subscribe({ next: res => this.messages = res });
    this.submitMessageSubs = this.aiDataSVC.submitMessage$.subscribe({ next: res => { if (res) this.submitMessage(); } });
    this.chatInProgressSubs = this.aiDataSVC.chatInProgress$.subscribe({ next: res => this.chatInProgress = res });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.calculateGPTWidth();
  }

  calculateGPTWidth() {
    this.gptChatWidth = `${window.innerWidth - 440}px`;
  }

  private isHubAssistantFlow(): boolean {
    return this.assistantId === ChatMessageComponent.HUB_ASSISTANT_ID;
  }

  submitMessage(): void {
    if (!this.message?.trim() || !this.validateRequest()) return;

    this.prepareForSubmission();
    this.pushUserMessage(this.message);

    if (!this.threadId) {
      console.log('submitMessage: ThreadId not defined!');
      return;
    }

    // Legacy path persists user message directly to thread messages endpoint.
    // Hub assistant flow (id=3) delegates message+run lifecycle to orchestrator endpoint.
    if (!this.isHubAssistantFlow()) {
      this.threadMessageSVC.createThreadMessage({
        role: 'user',
        assistantId: this.assistantId,
        threadId: this.threadId,
        content: this.message
      }).subscribe();
    }

    this.message = '';
    this.pushAssistantPlaceholder();

    if (this.isHubAssistantFlow()) {
      this.doSendRequestToAiOrchestrated();
    } else {
      this.doSendRequestToAi();
    }

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

  // Existing legacy chat-completions flow
  doSendRequestToAi(): void {
    const aimessages = this.aiDataSVC.getOpenAiMessages(this.localMessages, this.assistant.instructions);
    const requestData = this.buildRequestData(aimessages);

    this.asstMessage.openAiResult = new Observable<string>(observer => {
      const subscription = this.doOpenAICall(requestData).subscribe({
        next: (chunk) => this.handleStreamChunk(chunk, observer),
        error: (err) => this.handleStreamError(err, observer),
        complete: () => this.handleStreamComplete(observer),
      });

      return () => { subscription.unsubscribe(); };
    }).pipe(
      filter((result: string) => !result.startsWith('```chartjson'))
    );
  }

  // New hub assistant flow (backend orchestrator endpoint)
  doSendRequestToAiOrchestrated(): void {
    const requestData = {
      threadId: this.threadId,
      role: 'user',
      content: this.localMessages?.[this.localMessages.length - 2]?.content?.[0]?.text?.value ?? ''
    };

    this.asstMessage.openAiResult = new Observable<string>(observer => {
      const subscription = this.doOpenAIOrchestratedCall(requestData).subscribe({
        next: (finalMessage) => {
          const cleaned = this.removeFileReferencesPipe.transform(finalMessage);
          this.localAsstMsg.childStreamingData = cleaned;
          observer.next(cleaned);
          this.scrollToBottom(); // Auto-scroll as orchestrated message streams in
        },
        error: (err) => this.handleStreamError(err, observer),
        complete: () => {
          this.saveLastMessage();
          this.scrollToBottom(); // Auto-scroll when orchestrated streaming completes
          observer.complete();
        }
      });

      return () => { subscription.unsubscribe(); };
    });
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
      this.scrollToBottom(); // Auto-scroll when streaming completes
      observer.complete();
      return;
    }

    const newContent = this.removeFileReferencesPipe.transform(this.parseAndUpdateToolCalls(chunk));
    this.localAsstMsg.childStreamingData ??= '';
    this.localAsstMsg.childStreamingData += newContent;
    observer.next(JsonHelper.removeJsonObject(this.localAsstMsg.childStreamingData));
    this.scrollToBottom(); // Auto-scroll as new chunks arrive during streaming
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
    this.scrollToBottom(); // Auto-scroll when tool results are rendered
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

    // Hub flow already persists assistant output through backend run lifecycle.
    if (!this.isHubAssistantFlow()) {
      this.threadMessageSVC.createThreadMessage({
        assistantId: this.assistantId,
        threadId: this.threadId,
        role: 'assistant',
        content: this.asstMessage.content[0].text.value
      }).subscribe();
    }

    this.aiDataSVC.setMessageList(this.messages);
  }

  /**
   * Legacy streaming wrapper kept as Observable for existing caller flow.
   * Sonar refactor: delegates nested fetch/reader logic into focused helpers.
   */
  doOpenAICall(data: any): Observable<string> {
    return new Observable<string>((observer: any) => {
      const abortController = new AbortController();

      this.streamLegacyChatCompletion(data, observer, abortController.signal).catch((err) => {
        if (abortController.signal.aborted) {
          return;
        }
        console.error('Fetch failed:', err);
        observer.error(err);
      });

      return () => {
        abortController.abort();
        observer.complete();
      };
    });
  }

  /** Coordinates the fetch + stream-reader lifecycle for legacy chat-completions. */
  private async streamLegacyChatCompletion(
    data: any,
    observer: any,
    signal: AbortSignal,
  ): Promise<void> {
    const response = await this.fetchLegacyChatCompletion(data, signal);
    await this.emitLegacyStreamChunks(response, observer, signal);
    observer.complete();
  }

  /** Executes the legacy chat-completions request and validates the streaming response body. */
  private fetchLegacyChatCompletion(data: any, signal: AbortSignal): Promise<Response> {
    const url = `${this.apiBaseUrl}/chat-completions`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
      signal,
    }).then((response) => {
      if (!response.ok || !response.body) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response;
    });
  }

  /** Reads SSE bytes from the response and emits decoded chunks until done/aborted. */
  private async emitLegacyStreamChunks(response: Response, observer: any, signal: AbortSignal): Promise<void> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');

    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }

      observer.next(decoder.decode(value, { stream: true }));
    }
  }

  // New orchestrated stream reader
  doOpenAIOrchestratedCall(data: any): Observable<string> {
    return new Observable<string>((observer: any) => {
      const url = `${this.apiBaseUrl}/chat-completions/orchestrate/${this.assistantId}`;

      this.readOrchestratedStream(url, data, observer).catch(err => {
        console.error('Orchestrated fetch failed:', err);
        observer.error(err);
      });

      return () => observer.complete();
    });
  }

  private async readOrchestratedStream(url: string, data: any, observer: any): Promise<void> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let currentEvent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const parsed = this.processOrchestratedFrames(buffer, currentEvent, observer);
      buffer = parsed.buffer;
      currentEvent = parsed.currentEvent;

      if (parsed.shouldStop) return;
    }

    observer.complete();
  }

  private processOrchestratedFrames(buffer: string, currentEvent: string, observer: any):
    { buffer: string; currentEvent: string; shouldStop: boolean } {
    const frames = buffer.split('\n\n');
    const remainingBuffer = frames.pop() ?? '';
    let latestEvent = currentEvent;

    for (const frame of frames) {
      const parsedFrame = this.parseSseFrame(frame, latestEvent);
      latestEvent = parsedFrame.eventName;

      if (this.handleOrchestratedEvent(parsedFrame.eventName, parsedFrame.dataLine, observer)) {
        return { buffer: remainingBuffer, currentEvent: latestEvent, shouldStop: true };
      }
    }

    return { buffer: remainingBuffer, currentEvent: latestEvent, shouldStop: false };
  }

  private parseSseFrame(frame: string, fallbackEventName: string): { eventName: string; dataLine: string } {
    let eventName = fallbackEventName;
    let dataLine = '';

    for (const line of frame.split('\n')) {
      if (line.startsWith('event:')) {
        eventName = line.replace('event:', '').trim();
      } else if (line.startsWith('data:')) {
        dataLine += line.replace('data:', '').trim();
      }
    }

    return { eventName, dataLine };
  }

  private handleOrchestratedEvent(eventName: string, dataLine: string, observer: any): boolean {
    if (!dataLine) return false;

    const payload = this.tryParseJson<{ message?: string }>(dataLine);
    if (!payload) return false;

    if (eventName === 'completed') {
      observer.next(payload.message ?? '');
      observer.complete();
      return true;
    }

    if (eventName === 'error') {
      observer.error(payload.message ?? 'Orchestrated chat failed.');
      return true;
    }

    return false;
  }

  private tryParseJson<T>(value: string): T | null {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /** Reuses shared renderer to keep assistant tool-output handling consistent (Sonar duplicate-code fix). */
  processAiMessage(item: AssistantMessage, outputData: ToolFunctionOutput[]): void {
    processAssistantToolOutputs(
      item,
      outputData,
      this.apiDataSVC,
      this.aiDataSVC,
      this.threadId ?? undefined,
    );
    this.messageId = item.id;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.chat-content-area');
      if (container) container.scrollTop = container.scrollHeight;
    }, 0);
  }

  /**
   * Generates an RFC 4122 version 4 UUID using the shared `uuid` package.
   * The library uses cryptographically secure randomness in supported environments.
   */
  private generateGUID(): string {
    return uuidv4();
  }

  /** Removes OpenAI file citation annotations e.g. 【4:2†source.pdf】 */
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
