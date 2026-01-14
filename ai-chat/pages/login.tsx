import React, { useState } from 'react';
import { useRouter } from 'next/router';

const LoginPage: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { error } = router.query;

    const handleGoogleLogin = () => {
        setIsLoading(true);
        window.location.href = '/api/auth/google';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        AI Chat Assistant
                    </h1>
                    <p className="text-gray-300">
                        Chat inteligente para tu portfolio profesional
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-300 text-sm">
                {decodeURIComponent(error as string)}
              </span>
                        </div>
                    </div>
                )}

                {/* Login Card */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                    <h2 className="text-xl font-semibold text-white text-center mb-6">
                        Iniciar Sesión
                    </h2>

                    <p className="text-gray-300 text-center mb-8">
                        Usa tu cuenta de Google para acceder al chat AI
                    </p>

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-xl text-white hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Conectando con Google...
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continuar con Google
                            </>
                        )}
                    </button>

                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    Al iniciar sesión, aceptas nuestros{' '}
                    <a href="#" className="text-cyan-400 hover:text-cyan-300">Términos</a> y{' '}
                    <a href="#" className="text-cyan-400 hover:text-cyan-300">Privacidad</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;