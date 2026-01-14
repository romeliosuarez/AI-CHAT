import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { ChatMessage } from '@/types/chat';

interface MessageListProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="h-full overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                    <MessageItem key={message.id} message={message} />
                ))}

                {isLoading && (
                    <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="flex-1">
                            <div className="bg-gray-700/50 rounded-2xl rounded-tl-none p-4">
                                <div className="flex space-x-2">
                                    <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                    <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
                                    <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 ml-1">DeepSeek está pensando...</p>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default MessageList;