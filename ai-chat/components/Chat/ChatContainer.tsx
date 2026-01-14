import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { User } from '@/types/user';
import { ChatMessage } from '@/types/chat';

interface ChatContainerProps {
    user: User;
    messages?: ChatMessage[];
    onSendMessage?: (message: string) => void;
    onClearChat?: () => void;
    isLoading?: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
                                                         user,
                                                         messages = [],
                                                         onSendMessage = () => {},
                                                         onClearChat = () => {},
                                                         isLoading = false
                                                     }) => {
    return (
        <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
            <ChatHeader
                user={user}
                onClearChat={onClearChat}
                modelName="Gemini 2.0 Flash"
            />

            <div className="flex-1 overflow-hidden">
                <MessageList
                    messages={messages}
                    isLoading={isLoading}
                />
            </div>

            <div className="border-t border-gray-700 p-4">
                <MessageInput
                    onSendMessage={onSendMessage}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default ChatContainer;