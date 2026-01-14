export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
    timestamp: string;
}

export interface ChatRequest {
    message: string;
    history?: ChatMessage[];
    model?: string;
}

export interface ChatResponse {
    response: string;
    model: string;
    tokens_used: number;
    processing_time: number;
}

export interface OpenRouterModel {
    id: string;
    name: string;
    description: string;
    pricing: {
        prompt: number;
        completion: number;
    };
}