import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DataState } from "../data-state";
import { API_PATH_PPC, API_V1 } from "../../constants/constants";
import { DeleteThreadResponse, RenameThreadRequest, ThreadRequest, ThreadResponse } from "src/app/models/ai/thread.interface";

@Injectable({providedIn: "root"})

export class AIThreadService {
    constructor(
        private readonly http: HttpClient,
        private readonly dataState: DataState,
    ){}

    private readonly apiBaseURL = `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/assistant`

    getAllThreads(assistantId: number) {
        return this.http.get<ThreadResponse[]>(`${this.apiBaseURL}/${assistantId}/threads`);
    }

    getThreadById(assistantId: number, threadId: string) {
        return this.http.get<ThreadResponse>(`${this.apiBaseURL}/${assistantId}/threads/${threadId}`);
    }

    createThread(assistantId: number, data: ThreadRequest) {
        return this.http.post<ThreadResponse>(`${this.apiBaseURL}/${assistantId}/threads`, data);
    }

    deleteThread(assistantId: number, threadId: string) {
        return this.http.delete<DeleteThreadResponse>(`${this.apiBaseURL}/${assistantId}/threads/${threadId}`);
    }

    renameThread(data: RenameThreadRequest) {
        return this.http.put<ThreadResponse>(`${this.apiBaseURL}/${data.assistantId}/threads/${data.threadId}`, data);
    }
}