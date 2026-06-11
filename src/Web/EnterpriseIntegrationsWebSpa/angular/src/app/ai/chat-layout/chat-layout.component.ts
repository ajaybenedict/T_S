import { animate, style, transition, trigger } from '@angular/animations';
import { Overlay, PositionStrategy } from '@angular/cdk/overlay';
import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, finalize, map, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { breadcrumbConfig } from 'src/app/core/config/breadcrumb.config';
import { APP_ROUTE_CONFIG_URL, HUB_AI_BREADCRUMB, REVENUE_AI_BREADCRUMB } from 'src/app/core/constants/constants';
import { AIAssistantService } from 'src/app/core/services/ai/ai-assistant.service';
import { AIDataService } from 'src/app/core/services/ai/ai-data.service';
import { processAssistantToolOutputs } from 'src/app/core/services/ai/ai-message-renderer.helper';
import { AIThreadMessageService } from 'src/app/core/services/ai/ai-thread-message.service';
import { AIThreadService } from 'src/app/core/services/ai/ai-thread.service';
import { IonDataDiscoveryApiDataService } from 'src/app/core/services/AIAssistant/ion-data-discovery.service';
import { JsonHelper } from 'src/app/core/services/AIAssistant/json-helper';
import { DataState } from 'src/app/core/services/data-state';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { ApplicationIdEnum } from 'src/app/core/config/permissions.config';
import { Assistant, AssistantInLocalStorage, AssistantMessage, Prompt, ToolFunctionOutput } from 'src/app/models/ai/assistant.interface';
import { ThreadResponse } from 'src/app/models/ai/thread.interface';

@Component({
  selector: 'app-chat-layout',
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('600ms ease-out', style({ transform: 'translateX(0%)' })),
      ]),
      transition(':leave', [
        animate('600ms ease-in', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})
export class ChatLayoutComponent implements OnInit, OnDestroy {
  // for panel animation
  @HostBinding('@slideInOut') animation = true;
  panelVisible = true;

  declare currentURLSubs: Subscription;
  declare breadcrumbInput: string;
  declare assistantId: number;
  declare threadId: string | null;
  declare assistantInStorage: AssistantInLocalStorage | null;
  declare systemMessage: string;
  declare assistant: Assistant;
  declare messageId: string;
  threadList: ThreadResponse[] = [];
  recentThreadList: ThreadResponse[] = [];
  olderThreadList: ThreadResponse[] = [];
  declare currThreadId: string;
  declare deletedThreadId: string;
  declare threadIdSubs: Subscription;
  declare chatInProgressSubs: Subscription;
  declare threadListSubs: Subscription;
  declare threadClickedSubs: Subscription;
  declare newChatSubs: Subscription;
  declare chatTitleSubs: Subscription;
  declare messageListSubs: Subscription;
  declare threadChatThresholdReachedSubs: Subscription;
  declare threadDeletedSubs: Subscription;
  declare deletedThreadIdSubs: Subscription;

  message = "";
  messages: AssistantMessage[] = [];
  showLoader = false;
  showThreadTitleLoader = false;
  chatInProgress = false;
  showMore = false;
  isIon = false; // hardcoded to false and not changed anywhere. Logic can be changed later.
  selectedFunction = 0;
  promptsLength = 20;
  isChatThresholdReached = false;

  @ViewChild('chatInput') inputDiv!: ElementRef;
  leftOffset: string = '0px';

  constructor(
    private readonly dataState: DataState,
    private readonly aiDataSVC: AIDataService,
    private readonly aiAssistantSVC: AIAssistantService,
    private readonly threadSVC: AIThreadService,
    private readonly threadMessageSVC: AIThreadMessageService,
    private readonly apiDataSVC: IonDataDiscoveryApiDataService, // Need to use factory service in future.
    private readonly snackbarSVC: PpcSnackBarService,
    private readonly overlay: Overlay,
    private readonly router: Router,
  ) { }

  @HostListener('window:resize', ['$event'])
    onResize(event: any) {
      this.updateLeftOffset();
    }

  ngOnInit(): void {
    this.resetFlags();
    this.updateLeftOffset();
    // For breadcrumbs
    this.currentURLSubs = this.dataState.currentURL$.pipe(
      filter(Boolean), // filters empty string/null/undefined
      map(res => breadcrumbConfig.find(el => el.navigationURL === res)),
      filter(Boolean), // emits value only when a match was found
    ).subscribe({
      next: res => {
        const assistantBreadcrumb = this.router.url.includes(APP_ROUTE_CONFIG_URL.LANDING_PAGE)
          ? HUB_AI_BREADCRUMB
          : REVENUE_AI_BREADCRUMB;
        this.breadcrumbInput = `${res.displayValue}$${assistantBreadcrumb}`;        
      }
    });
    this.threadIdSubs = this.aiDataSVC.threadId$.subscribe({
      next: res => this.threadId = res
    });
    this.chatInProgressSubs = this.aiDataSVC.chatInProgress$.subscribe({
      next: res => this.chatInProgress = res
    });
    this.threadListSubs =  this.aiDataSVC.userThreads$.subscribe({
      next: res => {
        if(res?.length) {
          this.threadList = [...res.sort((a, b) => b.createdAt - a.createdAt)];
          const nowInSec = Math.floor(Date.now() / 1000); // current time in seconds (UNIX)
          const tenDaysAgoInSec = nowInSec - (10*24*60*60); // 10 days ago in seconds
          this.recentThreadList = [...this.threadList.filter(el => el.createdAt >= tenDaysAgoInSec).sort((a, b) => b.createdAt - a.createdAt)];
          this.olderThreadList = [...this.threadList.filter(el => el.createdAt < tenDaysAgoInSec).sort((a, b) => b.createdAt - a.createdAt)];
        }
        if(res?.length == 0) {
          this.threadList = [];
          this.recentThreadList = [];
          this.olderThreadList = [];
          this.aiDataSVC.setMessageList([]);
        }
      }
    });
    this.threadClickedSubs = this.aiDataSVC.threadClicked$.pipe(
      tap(() => {
        this.messages = [];
        this.aiDataSVC.setMessageList([]);
        this.resetFlags();
      }),
      switchMap((res) => {
        if(res) {
          return this.getThreadMessages();
        } else {
          return of(null);
        }
      }),
    ).subscribe();
    this.newChatSubs = this.aiDataSVC.newThreadCreated$.subscribe({
      next: res => {
        if(res) {
          this.createNewChat();
        }
      }
    });
    this.chatTitleSubs = this.aiDataSVC.chatTitle$.subscribe({
      next: res => {
        if(res) {
          this.createThreadWithTitle(res);
        }
      }
    });
    this.messageListSubs = this.aiDataSVC.messageList$.subscribe({
      next: res => this.messages = res
    });
    this.threadDeletedSubs = this.aiDataSVC.threadDeleted$.subscribe({
      next: res => {
        if(res) {
          this.handleThreadDeletion();
        }
      }
    })
    this.threadChatThresholdReachedSubs = this.aiDataSVC.threadChatThresholdReached$.subscribe({next: res => this.isChatThresholdReached = res});
    this.deletedThreadIdSubs = this.aiDataSVC.deletedthread$.subscribe({
      next: res => {
        if(res) {
          this.deletedThreadId = res;
        }
      }
    });
    this.initAssistant();
  }

  initAssistant() {
    const isLandingPage = this.router.url.includes(APP_ROUTE_CONFIG_URL.LANDING_PAGE);
    this.assistantId = isLandingPage ? 3 : 1;
    const applicationId = isLandingPage ? ApplicationIdEnum.StreamOneHub : ApplicationIdEnum.Insight;
    this.aiDataSVC.setAssistantId(this.assistantId);
    this.threadId = null;
    this.aiDataSVC.setThreadId(this.threadId);
    this.getDefaultAssistant();
    this.assistantInStorage = this.aiDataSVC.setAssistantInStorage();
    this.aiAssistantSVC.getAssistant(this.assistantId, applicationId).pipe(
      switchMap((assistant) => {
        if (!assistant) {
          this.systemMessage = 'No assistant found!';
          return of(null);
        }
        this.showLoader = true;
        this.assistant = assistant;
        this.aiDataSVC.setAssistant(assistant);
        if (this.assistantInStorage?.threadId) {
          this.aiDataSVC.setThreadInStorage();
          return this.getUserThreads();
        } else {
          return this.getUserThreads();
        }
      }),
      tap(() => {
        this.aiDataSVC.setShowPrompts(this.apiDataSVC.prompts.showPrompts);
      }),
      switchMap(() => this.getThreadMessages())
    ).subscribe({
      next: res => this.showLoader = false,
      error: err => {
        console.log('ChatLayoutComponent: Error in NgOninit - ', err );
        this.showLoader = false;
      },
      complete: () => this.showLoader = false,
    });
  }

  handleThreadDeletion() {
    if(!this.deletedThreadId) return;
    if(this.threadId === this.deletedThreadId || this.currThreadId === this.deletedThreadId) {
      this.createNewChat();
    }
    this.getUserThreads().subscribe();
    this.deletedThreadId = '';
  }
  resetFlags() {
    this.showMore = false;
    this.showLoader = false;
    this.showThreadTitleLoader = false;
    this.aiDataSVC.setChatInProgress(false);
    this.aiDataSVC.setSubmitMessage(false);
  }

  dismissPanel() {
    this.panelVisible = false;
  }

  onAnimationDone() {
    if (!this.panelVisible) {
      this.dataState.setAIPanelStatus('Closed');
    }
  }

  getDefaultAssistant() {
    // Check if the assistantId is already set in the service
    const asstId = this.assistantId;
    if (!asstId) {
      const storedDefaultAssistant = localStorage.getItem("defaultAssistant");
      // If "defaultAssistant" exists in localStorage, assign it; otherwise, use a fallback value
      if (storedDefaultAssistant) {
        this.aiDataSVC.setAssistantId(Number.parseInt(storedDefaultAssistant));
      } else {
        this.aiDataSVC.setAssistantId(1);
      }
    }
    // Store or update the default assistant ID in localStorage
    localStorage.setItem("defaultAssistant", asstId.toString());
  }

  getUserThreads() {
    return this.threadSVC.getAllThreads(this.assistantId).pipe(
      tap(res => {
        if (res?.length >= 0) {
          if(res?.length == 0) {
            this.threadId = null;
            this.aiDataSVC.setThreadId(this.threadId);
            this.aiDataSVC.setUserThreads([]);
            this.aiDataSVC.setMessageList([]);
          } else {
            this.aiDataSVC.setUserThreads(res);
          }
        }
      }),
      catchError(err => {
        this.systemMessage = `There is an error getting UserThreads - ${err}`;
        return of(null);
      }),
    );
  }

  createThread(title: string) {
    this.threadId = null;
    this.aiDataSVC.setThreadId(this.threadId);
    return this.threadSVC.createThread(this.assistantId, {assistantId: this.assistantId.toString(), name: title}).pipe(
      switchMap((res) => {
        this.threadId = res.id
        this.aiDataSVC.setThreadId(this.threadId);
        return this.getUserThreads();
      }),
      tap(() => {
        this.aiDataSVC.setThreadInStorage();
      }),
    )
  }

  getThreadMessages(): Observable<any> {
    this.messages = this.messages || [];//impt else n threadclick messages are null
    if (!this.threadId) {
      console.log(`ThreadId not found!`);
      return of(null);
    }
    // check if the threadId collected from the localStorage is available in the threadList. If not open the recent one in the list
    const isThreadAvailable = this.threadList.filter(el => el.id == this.threadId);
    if(isThreadAvailable.length == 0) {
      this.threadId = this.threadList[0].id;
      this.aiDataSVC.setThreadId(this.threadId);
    }
    this.currThreadId = this.threadId;
    this.showLoader = true;
    return this.threadMessageSVC.getAllMessagesForThread(this.assistantId, this.threadId).pipe(
      tap(res => {
        if(res.data?.length) {
          const reversedData = res.data.reverse();
          for (const item of reversedData) {
            const outputData = JsonHelper.extractJsonObject(item.content[0].text.value, "```json");
            this.processAiMessage(item, outputData);
            this.messages.push(item);
          }
          this.aiDataSVC.setMessageList(this.messages);
        } else {
          console.log('getThreadMessages: Thread messages not available!');
          this.messages = [];
          this.aiDataSVC.setMessageList([]);
        }
      }),
      finalize(() => this.showLoader = false),
    );
  }

  createNewChat() {
    this.resetFlags();
    this.messages = [];
    this.threadId = null;
    this.aiDataSVC.setMessageList([]);
    this.aiDataSVC.setThreadId(null);
  }

  private createThreadWithTitle(title: string) {
    // Guard: ensure assistantId is initialized before creating thread
    if (!this.assistantId) {
      console.warn('ChatLayoutComponent: assistantId not initialized yet. Deferring thread creation.');
      return;
    }

    this.showThreadTitleLoader = true;
    this.createThread(title).subscribe({
      error: (err) => {
        this.showThreadTitleLoader = false;
        console.error('Error creating thread with title:', err);
      },
      complete: () => {
        // Hide loader only after POST + GET thread completion
        this.showThreadTitleLoader = false;
        this.aiDataSVC.setSubmitMessage(true);
        this.aiDataSVC.setChatInProgress(true);
      }
    });
  }

  checkShowPrompts() {
    return this.aiDataSVC.getShowPrompts();
  }

  loadPrompt(prompt: string) {
    if (this.isChatThresholdReached) {
      this.showSnackbar('The number of questions for this chat session has reached the limit.');
      return;
    }
    if (this.chatInProgress) {
      this.showSnackbar('Wait till the current request completes to send another.');
      return;
    }

    const isFirstMessage = this.messages.length === 0;
    this.message = prompt;

    if (isFirstMessage) {
      // Dedicated loader for title-generation API; keeps existing loaders independent.
      this.showThreadTitleLoader = true;
      this.aiAssistantSVC.getChatSummaryTitle(this.message).pipe(
        tap((title) => {
          this.aiDataSVC.setChatTitle(title);
          this.aiDataSVC.setMessage(this.message);
          this.aiDataSVC.setChatInProgress(true);
        }),
      ).subscribe();
    } else {
      this.aiDataSVC.setMessage(this.message);
      this.aiDataSVC.setSubmitMessage(true);
      this.aiDataSVC.setChatInProgress(true);
    }
  }

  showSnackbar(msg: string) {
    const positionStrategy: PositionStrategy = this.overlay.position().flexibleConnectedTo(this.inputDiv)
        .withPositions([{
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -10,
        }])
        .withFlexibleDimensions(false)
        .withPush(false);
      this.snackbarSVC.show(msg, 3000, positionStrategy);
  }

  getLimitedPrompts(prompts: Prompt[]) {
    if (this.showMore) {
      return prompts;
    }
    return prompts.slice(0, this.apiDataSVC.prompts.defaultPromptsNo);
  }

  toggleShowMore(event: Event): void {
    event.preventDefault();
    this.showMore = !this.showMore;
  }

  /** Applies shared tool-output rendering logic used by both chat views (Sonar duplicate-code fix). */
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

  calculateThreadContainerHeight() {
    const windowHeight = window.innerHeight;
    const paddingOrMargin = 700; // adjust based on actual spacing above/below
    return `${(windowHeight - paddingOrMargin)}px`;
  }

  updateLeftOffset() {
    const vw = window.innerWidth;
    const sidebarWidth = 240;
    const padding = 40;
    const totalWidth = vw * 0.9;
    this.leftOffset = `${(vw - totalWidth) + sidebarWidth + padding}px`;
  }

  ngOnDestroy(): void {
    [
      this.currentURLSubs,
      this.threadIdSubs,
      this.chatInProgressSubs,
      this.threadListSubs,
      this.threadClickedSubs,
      this.newChatSubs,
      this.threadChatThresholdReachedSubs,
      this.threadDeletedSubs,
      this.chatTitleSubs,
      this.messageListSubs
    ].forEach(sub => sub?.unsubscribe());
    // clear threads & variables
    this.clearVariables();
  }

  clearVariables () {
    this.aiDataSVC.setUserThreads([]);
    this.message = "";
    this.messages = [];
    this.showLoader = false;
    this.showThreadTitleLoader = false;
    this.chatInProgress = false;
    this.showMore = false;
    this.isIon = false;
    this.selectedFunction = 0;
    this.promptsLength = 20;
    this.isChatThresholdReached = false;
  }

}
