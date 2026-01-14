import React from 'react';
import { User } from '@/types/auth';

interface ChatHeaderProps {
    user: User;
    onClearChat: () => void;
    modelName?: string;
    apiStatus?: 'checking' | 'online' | 'offline';
    onRetryConnection?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
                                                   user,
                                                   onClearChat,
                                                   modelName = "Gemini",
                                                   apiStatus = 'online',
                                                   onRetryConnection = () => {}
                                               }) => {
    const getStatusColor = () => {
        switch (apiStatus) {
            case 'online': return 'bg-green-500';
            case 'offline': return 'bg-red-500';
            case 'checking': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = () => {
        switch (apiStatus) {
            case 'online': return 'Conectado';
            case 'offline': return 'Desconectado';
            case 'checking': return 'Conectando...';
            default: return 'Desconocido';
        }
    };

    return (
        <div className="bg-gray-800/50 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 ${getStatusColor()} rounded-full border-2 border-gray-800`}></div>
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-white">AI Assistant</h1>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">Powered by</span>
                            <span className="text-xs font-medium text-cyan-300">
                {modelName}

              </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${apiStatus === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {getStatusText()}
              </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">

                    <button
                        onClick={onClearChat}
                        className="flex items-center px-3 py-1.5 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Limpiar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;