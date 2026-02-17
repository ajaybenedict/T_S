export type AIMessageRoleType = 'user' | 'assistant' | 'system' | 'tool';
// For POST calls
export interface ChatMessageRequest {
    role: AIMessageRoleType;
    content: string;
    assistantId: number;
    threadId: string;
}

export interface ChatMessageResponse {
    id: string;
    object: "thread.message";
    created_at: number;
    thread_id: string;
    role: AIMessageRoleType;
    content: ChatMessageTextContent[];
    attachments: any[];
    metadata: Record<string, any>;
    assistant_id: number | null;
    run_id: number | null;
}

// Type = "text"
export interface ChatMessageTextContent {
    type: "text";
    text: {
        value: string;
        annotations: any[];
    };
}

// For GET calls
export interface ChatMessageListResponse {
    object: "list";
    data: ChatMessageResponse[];
    first_id: string | null;
    last_id: string | null;
    has_more: boolean;
}