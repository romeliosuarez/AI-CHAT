import { ChatMessage, ChatResponse } from '@/types/chat';

const DEFAULT_CONFIG = {
    model: 'deepseek/deepseek-r1-0528:free',
    max_tokens: 1024,
    temperature: 0.7,
    top_p: 0.95,
    stream: false,
};

export async function getDeepSeekResponse(
    message: string,
    history: ChatMessage[] = [],
    apiKey: string
): Promise<ChatResponse> {
    try {
        const messages = formatMessagesForAI(message, history);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://chat-ai-portfolio.vercel.app',
                'X-Title': 'AI Chat Portfolio',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: DEFAULT_CONFIG.model,
                messages: messages,
                max_tokens: DEFAULT_CONFIG.max_tokens,
                temperature: DEFAULT_CONFIG.temperature,
                top_p: DEFAULT_CONFIG.top_p,
                stream: DEFAULT_CONFIG.stream,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter API error:', {
                status: response.status,
                error: errorData
            });

            return {
                response: `Error del servicio (${response.status}): ${
                    errorData.error?.message || 'Intenta de nuevo más tarde'
                }`,
                model: DEFAULT_CONFIG.model,
                tokens_used: 0,
                processing_time: 0,
            };
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0]?.message?.content) {
            return {
                response: 'El servicio de AI no pudo generar una respuesta en este momento.',
                model: data.model || DEFAULT_CONFIG.model,
                tokens_used: data.usage?.total_tokens || 0,
                processing_time: 0,
            };
        }

        return {
            response: data.choices[0].message.content,
            model: data.model || DEFAULT_CONFIG.model,
            tokens_used: data.usage?.total_tokens || 0,
            processing_time: 0,
        };
    } catch (error: any) {
        console.error('Error calling OpenRouter:', error);

        return {
            response: 'Lo siento, hubo un error al conectar con el servicio de AI. Por favor, intenta de nuevo.',
            model: DEFAULT_CONFIG.model,
            tokens_used: 0,
            processing_time: 0,
        };
    }
}

function formatMessagesForAI(
    newMessage: string,
    history: ChatMessage[]
): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    const recentHistory = history.slice(-6);

    recentHistory.forEach(msg => {
        const role = msg.role === 'assistant' ? 'assistant' : 'user';
        messages.push({ role, content: msg.content });
    });

    messages.push({ role: 'user', content: newMessage });

    return messages;
}

export async function verifyOpenRouterKey(apiKey: string): Promise<boolean> {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) return false;

        const data = await response.json();
        // Verificar que el modelo DeepSeek esté disponible
        const deepseekAvailable = data.data?.some((model: any) =>
            model.id === 'deepseek/deepseek-r1-0528:free'
        );

        return deepseekAvailable || false;
    } catch (error) {
        console.error('Error verifying OpenRouter key:', error);
        return false;
    }
}