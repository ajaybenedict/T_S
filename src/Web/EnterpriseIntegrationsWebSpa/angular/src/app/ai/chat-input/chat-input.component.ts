import { Overlay, PositionStrategy } from '@angular/cdk/overlay';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { DISCLAIMER_TEXT, QUESTIONS_ALLOWED_PER_THREAD } from 'src/app/core/constants/constants';
import { AIAssistantService } from 'src/app/core/services/ai/ai-assistant.service';
import { AIDataService } from 'src/app/core/services/ai/ai-data.service';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent implements OnInit, OnDestroy {

  chatInProgress = false;

  declare message: string;
  declare messageListSubs: Subscription;
  declare chatInProgressSubs: Subscription;

  @ViewChild('snackbarAnchor') inputDiv!: ElementRef;

  declare userMsgCount: number;
  allowedCount = QUESTIONS_ALLOWED_PER_THREAD;

  disclaimerText = DISCLAIMER_TEXT.AI_ASSISTANT;

  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  constructor(
    private readonly aiDataSVC: AIDataService,
    private readonly aiAssistantSVC: AIAssistantService,
    private readonly snackbarSVC: PpcSnackBarService,
    private readonly overlay: Overlay,
  ) {}

  ngOnInit(): void {
    this.chatInProgressSubs = this.aiDataSVC.chatInProgress$.subscribe({
      next: res => this.chatInProgress = res
    });
    this.userMsgCount = 0;
    this.messageListSubs = this.aiDataSVC.messageList$.subscribe({
      next: res => {
        this.userMsgCount = res.filter(el => el.role == 'user').length;
        if(this.userMsgCount >= this.allowedCount ) {
          this.aiDataSVC.setThreadChatThresholdReached(true);
        } else {
          this.aiDataSVC.setThreadChatThresholdReached(false);
        }
      }
    });
  }

  adjustTextareaHeight(event: any): void {
    const textarea: HTMLTextAreaElement = event.target;
    textarea.style.height = 'auto'; // reset to shrink if needed
    const newHeight = textarea.scrollHeight;
    const maxHeight = 65; // match CSS max-height
    textarea.style.height = `${Math.min(newHeight, maxHeight)}px`;
  }

  resetTextAreaHeight() {
    if (this.messageInput) {
      const textarea = this.messageInput.nativeElement;
      textarea.style.height = 'auto';
    }
  }

  checkForEnter(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent default Enter behavior (new line)
      this.submitMessage(); // Call your submit function
    }
  }

  submitMessage() {
    if (!this.message.trim()) return;

    if (this.chatInProgress) {
      this.showSnackbar('Wait till the current request completes to send another.');
      return;
    };

    const isFirstMessage = this.userMsgCount === 0;
    const messageToSend = this.message;

    if (isFirstMessage) {
      this.aiAssistantSVC.getChatSummaryTitle(messageToSend).pipe(
        tap((title) => {
          this.aiDataSVC.setChatTitle(title);
          this.aiDataSVC.setMessage(messageToSend);
          this.aiDataSVC.setChatInProgress(true);
        })
      ).subscribe();

    } else {
      // Normal flow for subsequent messages
      this.aiDataSVC.setMessage(messageToSend);
      this.aiDataSVC.setSubmitMessage(true);
      this.aiDataSVC.setChatInProgress(true);
    }

    this.resetTextAreaHeight();
    this.message = '';
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

  createNewChat() {
    this.aiDataSVC.setNewThreadCreated(true);
  }

  ngOnDestroy() {
    for (const sub of [this.chatInProgressSubs, this.messageListSubs]) {
      sub?.unsubscribe();
    }
  }

}
