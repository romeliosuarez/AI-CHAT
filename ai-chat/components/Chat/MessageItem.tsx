import React from 'react';
import { ChatMessage } from '@/types/chat';

interface MessageItemProps {
    message: ChatMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const time = new Date(message.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                <div className={`rounded-2xl p-4 ${
                    isUser
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none'
                        : 'bg-gray-700/60 text-gray-100 rounded-bl-none'
                }`}>
                    <div className="whitespace-pre-wrap break-words">
                        {message.content}
                    </div>
                </div>

                <div className={`flex items-center mt-1 space-x-2 text-xs ${
                    isUser ? 'justify-end' : 'justify-start'
                }`}>
                    <span className="text-gray-500">{time}</span>
                    {isUser && (
                        <span className="text-blue-400">Tú</span>
                    )}
                    {!isUser && (
                        <span className="text-cyan-400">AI</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageItem;