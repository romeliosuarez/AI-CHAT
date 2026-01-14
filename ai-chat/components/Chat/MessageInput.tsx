import React, { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    isApiOnline?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
                                                       onSendMessage,
                                                       isLoading,
                                                       isApiOnline = true
                                                   }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage && !isLoading && isApiOnline) {
            onSendMessage(trimmedMessage);
            setMessage('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
          <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                  isApiOnline
                      ? "Escribe tu mensaje aquí..."
                      : "Servicio de AI no disponible temporalmente..."
              }
              className={`w-full bg-gray-700/50 border ${
                  isApiOnline ? 'border-gray-600' : 'border-red-500/50'
              } rounded-xl p-4 pr-12 focus:outline-none focus:ring-1 ${
                  isApiOnline ? 'focus:ring-cyan-500 focus:border-cyan-500' : 'focus:ring-red-500 focus:border-red-500'
              } text-white placeholder-gray-400 resize-none transition-colors`}
              rows={2}
              disabled={isLoading || !isApiOnline}
          />

                    {message && isApiOnline && (
                        <button
                            onClick={() => setMessage('')}
                            className="absolute right-3 bottom-3 p-1 text-gray-400 hover:text-white transition-colors"
                            disabled={isLoading}
                            type="button"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || isLoading || !isApiOnline}
                    className={`px-6 py-3 ${
                        isApiOnline
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                            : 'bg-gray-600 cursor-not-allowed'
                    } text-white font-medium rounded-lg transition-all flex items-center ${
                        (!message.trim() || isLoading || !isApiOnline) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {isLoading ? (
                        <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Pensando...
                        </>
                    ) : (
                        <>
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            {isApiOnline ? 'Enviar' : 'Offline'}
                        </>
                    )}
                </button>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
                {isApiOnline
                    ? 'Presiona Enter para enviar • Shift + Enter para nueva línea'
                    : 'El servicio de AI está temporalmente no disponible. Por favor, intenta más tarde.'}
            </p>
        </div>
    );
};

export default MessageInput;