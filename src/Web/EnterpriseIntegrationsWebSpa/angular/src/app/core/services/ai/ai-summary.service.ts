import { Injectable } from "@angular/core";
import { DataState } from "../data-state";
import { CORE_PATH_AI, API_V1 } from "../../constants/constants";
import { Observable } from "rxjs";
import { readChatCompletionText } from "./ai-streaming.helper";

@Injectable({providedIn: 'root'})

export class AISummaryService {
    constructor(        
        private readonly dataState: DataState,
    ) {}

    private readonly apiBaseUrl = `${this.dataState.getCoreBaseUrl()}/${CORE_PATH_AI}/${API_V1}/assistant`;

    /**
     * Streams assistant summary text from chat-completions.
     * Sonar refactor: shared stream parser lives in ai-streaming.helper.
     */
    getSummary(systemPrompt: string, jsonData: string) {
        const body = {
            model: "gpt-4o",
            stream: true, // <— important for streaming
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: jsonData }
            ],
            max_tokens: 4000,
            n: 1,
            temperature: 0.2,
        };

        const url = `${this.apiBaseUrl}/chat-completions`;

        return new Observable<string>((observer) => {
            readChatCompletionText(url, body)
                .then((summaryText) => {
                    observer.next(summaryText || "");
                    observer.complete();
                })
                .catch((err) => {
                    console.error("Streaming error:", err); 
                    observer.error(err);
                    observer.complete();
                });
        });
    }
}