import { Injectable } from "@angular/core";
import { DataState } from "../data-state";
import { CORE_PATH_AI, API_V1 } from "../../constants/constants";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})

export class AISummaryService {
    constructor(        
        private readonly dataState: DataState,
    ) {}

    private readonly apiBaseUrl = `${this.dataState.getCoreBaseUrl()}/${CORE_PATH_AI}/${API_V1}/assistant`;

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
                    observer.next(accumulatedText.trim() || "");
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