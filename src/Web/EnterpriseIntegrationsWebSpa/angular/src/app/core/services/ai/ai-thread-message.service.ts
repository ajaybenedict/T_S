import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DataState } from "../data-state";
import { API_PATH_PPC, API_V1 } from "../../constants/constants";
import { ChatMessageListResponse, ChatMessageRequest, ChatMessageResponse } from "src/app/models/ai/thread-message.interface";

@Injectable({providedIn: 'root'})

export class AIThreadMessageService {
    constructor(
        private readonly http: HttpClient,
        private readonly dataState: DataState,
    ){}
    private readonly apiBaseURL = `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/assistant`;

    getAllMessagesForThread(assistantId: number, threadId: string){
        return this.http.get<ChatMessageListResponse>(`${this.apiBaseURL}/${assistantId}/threads/${threadId}/messages`);
    }

    createThreadMessage(data: ChatMessageRequest){        
        return this.http.post<ChatMessageResponse>(`${this.apiBaseURL}/${data.assistantId}/threads/${data.threadId}/messages`, {role: data.role, content: data.content});
    }   
}