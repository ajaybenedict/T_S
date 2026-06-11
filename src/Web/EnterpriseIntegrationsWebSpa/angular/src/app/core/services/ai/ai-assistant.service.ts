import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { Assistant, PromptGroup, Tool } from "src/app/models/ai/assistant.interface";
import { JsonHelper } from "../AIAssistant/json-helper";
import { DataState } from "../data-state";
import { API_PATH_PPC, API_V1, CORE_PATH_AI } from "../../constants/constants";
import { readChatCompletionText } from "./ai-streaming.helper";

@Injectable({ providedIn: "root" })

export class AIAssistantService {

    private readonly apiBaseURL = `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/assistant`
    constructor(
        private readonly http: HttpClient,
        private readonly dataState: DataState,
    ) { }

    getAssistant(assistantId: number, applicationId: number): Observable<Assistant> {
        return this.http.get<Assistant>(`${this.apiBaseURL}/${assistantId}/${applicationId}`).pipe(
            map((response: Assistant) => {
                // Parse 'prompts' if it's a stringified JSON
                if (typeof response.prompts === 'string' && JsonHelper.isValidJSON(response.prompts)) {
                    response.prompts = JSON.parse(response.prompts) as PromptGroup[];
                } else if (!Array.isArray(response.prompts)) {
                    response.prompts = [];
                }
                // Parse 'tools' if it's a stringified JSON
                if (typeof response.tools === 'string' && JsonHelper.isValidJSON(response.tools)) {
                    response.tools = JSON.parse(response.tools) as Tool[];
                } else if (!Array.isArray(response.tools)) {
                    response.tools = [];
                }
                // Default model fallback
                if (!response.model || response.model === '') {
                    response.model = 'gpt-4o-2024-11-20';
                }
                return response;
            }),
            catchError(this.handleError)
        );
    }
    /**
     * Builds a concise thread title from the first user message using streaming chat-completions.
     * Sonar refactor: stream parsing is delegated to ai-streaming.helper.
     */
    getChatSummaryTitle(firstMessage: string): Observable<string> {
      const now = new Date().toLocaleString(); 
      const systemPrompt = `Today is ${now}. Summarize this message into a concise chat title.`;
      const body = {
        model: "gpt-4o",
        stream: true, // <— important for streaming
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: firstMessage }
        ],
        max_tokens: 4000,
        n: 1,
        temperature: 0.2,
      };

    const url = `${this.dataState.getCoreBaseUrl()}/${CORE_PATH_AI}/${API_V1}/assistant/chat-completions`;

      return new Observable<string>((observer) => {
        readChatCompletionText(url, body)
          .then((title) => {
            observer.next(title || "New Chat");
            observer.complete();
          })
          .catch((err) => {
            console.error("Streaming error:", err);
            observer.next("New Chat");
            observer.complete();
          });
      });
    }


    private handleError(error: HttpErrorResponse) {
        let errorMessage: string;
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            errorMessage = JSON.stringify(error);
        }
        console.error(`Error in GetAssistant API- ${errorMessage}`);
        return throwError(errorMessage);
    }
}
