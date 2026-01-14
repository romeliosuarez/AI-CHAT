import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import { User } from '@/types/auth';
import { ChatMessage } from '@/types/chat';

interface ChatInterfaceProps {
    user: User;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            content: '¡Hola! Soy tu asistente AI con DeepSeek R1. ¿En qué puedo ayudarte hoy?',
            role: 'assistant',
            timestamp: new Date().toISOString(),
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        checkApiStatus();
    }, []);

    const checkApiStatus = async () => {
        try {
            const response = await fetch('/api/chat/status');
            const data = await response.json();
            setApiStatus(data.available ? 'online' : 'offline');
        } catch (error) {
            console.error('Error checking API status:', error);
            setApiStatus('offline');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoading || apiStatus === 'offline') return;

        setError(null);

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content,
            role: 'user',
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    history: messages.slice(-6),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || data.error || 'Error al obtener respuesta');

                const errorMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    content: `Lo siento, hubo un problema: ${data.message || data.error || 'Error desconocido'}. Por favor, intenta de nuevo.`,
                    role: 'assistant',
                    timestamp: new Date().toISOString(),
                };

                setMessages(prev => [...prev, errorMessage]);
                setApiStatus('offline');
                return;
            }

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: data.response,
                role: 'assistant',
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMessage]);

            if (apiStatus === 'checking') {
                setApiStatus('online');
            }

        } catch (error: any) {
            console.error('Error sending message:', error);

            const errorMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                content: 'Lo siento, hubo un problema de conexión. Por favor, verifica tu internet e intenta de nuevo.',
                role: 'assistant',
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, errorMessage]);
            setError('Error de conexión');
            setApiStatus('offline');

        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: '1',
                content: '¡Hola! He limpiado nuestro historial de chat. ¿En qué puedo ayudarte ahora?',
                role: 'assistant',
                timestamp: new Date().toISOString(),
            }
        ]);
        setError(null);
    };

    const handleRetryConnection = () => {
        setError(null);
        setApiStatus('checking');
        checkApiStatus();
    };

    return (
        <div className="w-full h-full bg-gray-800/30 rounded-2xl border border-gray-700 flex flex-col">
            <ChatHeader
                user={user}
                onClearChat={handleClearChat}
                modelName="DeepSeek R1"
                apiStatus={apiStatus}
                onRetryConnection={handleRetryConnection}
            />

            {apiStatus === 'checking' && (
                <div className="bg-blue-500/10 border-b border-blue-500/30 p-3">
                    <div className="flex items-center justify-center">
                        <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-blue-400 text-sm">Conectando con DeepSeek...</span>
                    </div>
                </div>
            )}

            {apiStatus === 'offline' && (
                <div className="bg-red-500/10 border-b border-red-500/30 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="h-4 w-4 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-400 text-sm">Servicio de AI no disponible</span>
                        </div>
                        <button
                            onClick={handleRetryConnection}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            )}

            {error && apiStatus === 'online' && (
                <div className="bg-yellow-500/10 border-b border-yellow-500/30 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="h-4 w-4 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5" />
                            </svg>
                            <span className="text-yellow-400 text-sm">{error}</span>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-yellow-400 hover:text-yellow-300 text-sm"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <MessageList
                        messages={messages}
                        isLoading={isLoading}
                    />
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-gray-700 p-4">
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        isApiOnline={apiStatus === 'online'}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;