import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { Assistant, PromptGroup, Tool } from "src/app/models/ai/assistant.interface";
import { JsonHelper } from "../AIAssistant/json-helper";
import { DataState } from "../data-state";
import { API_PATH_PPC, API_V1, CORE_PATH_AI } from "../../constants/constants";

@Injectable({ providedIn: "root" })

export class AIAssistantService {

    private readonly apiBaseURL = `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/assistant`
    constructor(
        private readonly http: HttpClient,
        private readonly dataState: DataState,
    ) { }

    getAssistant(assistantId: number): Observable<Assistant> {
        return this.http.get<Assistant>(`${this.apiBaseURL}/${assistantId}`).pipe(
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
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream", // streaming response
          },
          body: JSON.stringify(body),
        })
          .then(async (response) => {
            if (!response.ok || !response.body) {
              throw new Error("Failed to fetch chat summary stream.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = "";

            // Read the stream chunk by chunk
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });

              // Most streaming APIs send data prefixed with "data:"
              const lines = chunk.split("\n").filter(line => line.trim().startsWith("data:"));

              for (const line of lines) {
                const jsonStr = line.replace(/^data:\s*/, "").trim();
                if (jsonStr === "[DONE]") {
                  observer.next(accumulatedText.trim());
                  observer.complete();
                  return;
                }

                try {
                  const data = JSON.parse(jsonStr);
                  const delta = data?.choices?.[0]?.delta?.content;
                  if (delta) {
                    accumulatedText += delta;
                  }
                } catch (e) {
                  console.warn("Error parsing stream chunk:", e);
                }
              }
            }

            // Complete if stream ends without explicit [DONE]
            observer.next(accumulatedText.trim() || "New Chat");
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
