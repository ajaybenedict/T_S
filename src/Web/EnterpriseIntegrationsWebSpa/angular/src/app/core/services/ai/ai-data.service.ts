import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { Assistant, AssistantInLocalStorage, AssistantMessage } from "src/app/models/ai/assistant.interface";
import { ThreadResponse } from "src/app/models/ai/thread.interface";

@Injectable({ providedIn: 'root' })

export class AIDataService {

    // Variables
    declare private showPrompts: boolean;
    private assistantId: number | null = null;
    private threadId: string | null = null;

    // Subjects
    private readonly assistantBS = new BehaviorSubject<Assistant | null>(null);
    private readonly assistantIdBS = new BehaviorSubject<number | null>(null);
    private readonly threadIdBS = new BehaviorSubject<string | null>(null);
    private readonly chatTitleBS = new BehaviorSubject<string | null>(null);
    private readonly newThreadCreated = new Subject<boolean>;
    private readonly messageBS = new Subject<string>;
    private readonly messageListBS = new Subject<AssistantMessage[]>;
    private readonly submitMessageBS = new Subject<boolean>;
    private readonly chatInProgressBS = new Subject<boolean>;
    private readonly userThreadsBS = new Subject<ThreadResponse[] | null>;
    private readonly threadClickedBS = new Subject<boolean>;
    private readonly threadChatThresholdReachedBS = new Subject<boolean>;
    private readonly threadDeletedBS = new Subject<boolean>;
    private readonly deletedThreadBS = new Subject<string>();

    // Observables
    assistant$ = this.assistantBS.asObservable();
    assistantId$ = this.assistantIdBS.asObservable();
    threadId$ = this.threadIdBS.asObservable();
    chatTitle$ = this.chatTitleBS.asObservable();
    newThreadCreated$ = this.newThreadCreated.asObservable();
    message$ = this.messageBS.asObservable();
    messageList$ = this.messageListBS.asObservable();
    submitMessage$ = this.submitMessageBS.asObservable();
    chatInProgress$ = this.chatInProgressBS.asObservable();
    userThreads$ = this.userThreadsBS.asObservable();
    threadClicked$ = this.threadClickedBS.asObservable();
    threadChatThresholdReached$ = this.threadChatThresholdReachedBS.asObservable();
    threadDeleted$ = this.threadDeletedBS.asObservable();
    deletedthread$ = this.deletedThreadBS.asObservable();

    // Setters & Getters - Variables & Subjects
    setChatTitle(value: string) {
        this.chatTitleBS.next(value);
    }

    setAssistant(value: Assistant) {
        this.assistantBS.next(value);
    }

    getAssistantId() {
        return this.assistantId;
    }

    setAssistantId(value: number) {
        this.assistantIdBS.next(value);
        this.assistantId = value;
    }

    setThreadId(value: string | null) {
        this.threadIdBS.next(value);
        this.threadId = value;
    }

    setNewThreadCreated(value: boolean) {
        this.newThreadCreated.next(value);
    }

    setMessage(value: string) {
        this.messageBS.next(value);
    }

    setMessageList(value: AssistantMessage[]) {
        this.messageListBS.next(value);
    }

    setSubmitMessage(value: boolean) {
        this.submitMessageBS.next(value);
    }

    setChatInProgress(value: boolean) {
        this.chatInProgressBS.next(value);
    }

    setShowPrompts(value: boolean) {
        this.showPrompts = value;
    }

    setUserThreads(value: ThreadResponse[]) {
        this.userThreadsBS.next([...value]);
    }

    setThreadClicked(value: boolean) {
        this.threadClickedBS.next(value);
    }

    setThreadChatThresholdReached(value: boolean) {
        this.threadChatThresholdReachedBS.next(value);
    }

    setThreadDeleted(value: boolean) {
        this.threadDeletedBS.next(value);
    }

    setDeletedThread(value: string) {
        this.deletedThreadBS.next(value);
    }

    getShowPrompts() {
        return this.showPrompts;
    }

    setThreadInStorage() {
        const assistants = this.getAssistantsFromStorage();
        const assistant = assistants.find( x => x.assistantId == this.assistantId);
        if (!assistant) return;
        if (this.threadId) {
            assistant.threadId = this.threadId;
        } else if (assistant.threadId) {
            this.setThreadId(assistant.threadId);
        }

        this.saveAssistantsToStorage(assistants);
        return assistant;
    }

    setAssistantInStorage() {
        const assistants: AssistantInLocalStorage[] = this.getAssistantsFromStorage();
        let assistant = assistants.find(x => x.assistantId == this.assistantId);
        if (!assistant && this.assistantId) {
            assistant = { assistantId: this.assistantId };
            assistants.push(assistant);
        }
        if (assistant?.showPrompts != null) {
            this.showPrompts = assistant.showPrompts;
        }
        this.saveAssistantsToStorage(assistants);
        return assistant ?? null;
    }

    private getAssistantsFromStorage(): AssistantInLocalStorage[] {
        const stored = localStorage.getItem('assistants');
        return stored ? JSON.parse(stored) : [];
    }

    private saveAssistantsToStorage(assistants: AssistantInLocalStorage[]): void {
        localStorage.setItem('assistants', JSON.stringify(assistants));
    }

    getOpenAiMessages(messages: any[], systemMessage: string): any {
        let openAiMessages: any = [];

        // Get current datetime and format it as a string
        const currentDateTime = new Date().toISOString(); // ISO 8601 format

        // Modify the systemMessage to include the current datetime
        systemMessage = `${systemMessage} Impt! The current datetime is: ${currentDateTime}. You can use the current date and time if user asks questions which include data retrievals based on relative dates like last year, today, etc.`;
        openAiMessages.push({
            "role": "system",
            "content": systemMessage
        });


        messages.forEach((item: any, index: number) => {
            let content = item.content[0].text.value;
            let message: any = {
                "role": item.role,
                "content": content
            }

            if (item.tool_calls)
                message.tool_calls = item.tool_calls

            if (item.tool_call_id)
                message.tool_call_id = item.tool_call_id

            openAiMessages.push(message);
        })

        return openAiMessages;
    }

}