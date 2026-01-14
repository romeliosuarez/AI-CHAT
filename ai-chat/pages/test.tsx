import React, { useState } from 'react';
import ChatContainer from '@/components/Chat/ChatContainer';
import { ChatMessage } from '@/types/chat';

// Datos de prueba para el usuario
const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Usuario de Prueba',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test-user',
    given_name: 'Usuario',
    family_name: 'Prueba',
    locale: 'es-ES',
};

// Mensajes iniciales de prueba
const initialMessages: ChatMessage[] = [
    {
        id: '1',
        content: '¡Hola! Soy tu asistente AI. ¿En qué puedo ayudarte hoy?',
        role: 'assistant',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutos atrás
    },
    {
        id: '2',
        content: 'Hola, ¿puedes explicarme cómo funciona este chat?',
        role: 'user',
        timestamp: new Date(Date.now() - 240000).toISOString(), // 4 minutos atrás
    },
    {
        id: '3',
        content: '¡Claro! Este es un chat AI interactivo que usa modelos avanzados para conversar contigo. Puedes preguntarme sobre cualquier tema y yo intentaré ayudarte de la mejor manera posible.',
        role: 'assistant',
        timestamp: new Date(Date.now() - 180000).toISOString(), // 3 minutos atrás
    },
    {
        id: '4',
        content: '¿Qué tecnologías usas?',
        role: 'user',
        timestamp: new Date(Date.now() - 120000).toISOString(), // 2 minutos atrás
    },
    {
        id: '5',
        content: 'Estoy construido con Next.js, TypeScript y Tailwind CSS, y uso el modelo Gemini 2.0 Flash a través de OpenRouter para generar respuestas inteligentes.',
        role: 'assistant',
        timestamp: new Date(Date.now() - 60000).toISOString(), // 1 minuto atrás
    },
];

const TestChatPage: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);

    // Simular el envío de mensajes
    const handleSendMessage = (content: string) => {
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content,
            role: 'user',
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        // Simular respuesta del AI después de 1 segundo
        setTimeout(() => {
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: `Esta es una respuesta simulada a: "${content}". En una implementación real, esto vendría de la API de Gemini.`,
                role: 'assistant',
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1000);
    };

    // Limpiar el chat
    const handleClearChat = () => {
        setMessages([
            {
                id: '1',
                content: '¡Hola! He limpiado nuestro historial de chat. ¿En qué puedo ayudarte ahora?',
                role: 'assistant',
                timestamp: new Date().toISOString(),
            }
        ]);
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header de la página de prueba */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-white mb-2">🧪 Prueba de Componentes del Chat</h1>
                    <p className="text-gray-400">
                        Esta página muestra todos los componentes del chat funcionando juntos sin conexión a API.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            onClick={() => handleSendMessage('¿Cómo estás?')}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors"
                        >
                            Enviar mensaje de prueba
                        </button>
                        <button
                            onClick={handleClearChat}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                        >
                            Limpiar chat
                        </button>
                        <button
                            onClick={() => setIsLoading(!isLoading)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                        >
                            {isLoading ? 'Detener loading' : 'Simular loading'}
                        </button>
                    </div>
                </div>
            </div>

            {/* El chat principal */}
            <ChatContainer
                user={mockUser}
                messages={messages}
                onSendMessage={handleSendMessage}
                onClearChat={handleClearChat}
                isLoading={isLoading}
            />

            {/* Panel de información de debug */}
            <div className="fixed bottom-4 right-4 max-w-xs bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
                <h3 className="font-medium text-white mb-2">ℹ️ Información de Debug</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Total mensajes:</span>
                        <span className="text-white">{messages.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Mensajes usuario:</span>
                        <span className="text-blue-400">
              {messages.filter(m => m.role === 'user').length}
            </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Mensajes AI:</span>
                        <span className="text-cyan-400">
              {messages.filter(m => m.role === 'assistant').length}
            </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Estado:</span>
                        <span className={`font-medium ${isLoading ? 'text-yellow-400' : 'text-green-400'}`}>
              {isLoading ? 'Cargando...' : 'Listo'}
            </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestChatPage;