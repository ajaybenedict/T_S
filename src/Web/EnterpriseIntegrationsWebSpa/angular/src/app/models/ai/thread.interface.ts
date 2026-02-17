export interface ThreadResponse {
        id: string;
        createdAt: number;
        userId: string;
        summary: string;
        metaData?: Record<string, string>;
        // will be null always in threads
        messages?: null;
}

export interface ThreadRequest {
        metadata?: Record<string, string>;
        assistantId: string;
        name: string;
}

export interface RenameThreadRequest {
        threadId: string;
        assistantId: string;
        name: string; // new name for thread
}

export interface DeleteThreadResponse {
        isSuccess: boolean;
}