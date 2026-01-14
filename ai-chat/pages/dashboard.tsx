import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ChatInterface from '@/components/Chat/ChatInterface';
import { User } from '@/types/auth';
import { ChatMessage } from '@/types/chat';

const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
            <div className="h-16 w-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-6 text-gray-300">Cargando chat AI...</p>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('/api/auth/session');
                const data = await response.json();

                if (data.authenticated && data.user) {
                    setUser(data.user);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error checking session:', error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, [router]);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                router.push('/login');
            } else {
                console.error('Logout failed:', data.error);
                alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error de conexión al cerrar sesión.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Navbar */}
            <div className="bg-gray-800/50 border-b border-gray-700 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">AI Chat Dashboard</h1>
                            <p className="text-xs text-gray-400">Powered by DeepSeek R1</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                {user.email}
                            </p>
                        </div>

                        <div className="relative group">
                            <div className="flex items-center space-x-3">
                            <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full border-2 border-cyan-500 cursor-pointer"
                                />

                            </div>

                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="p-3 border-b border-gray-700">
                                    <p className="font-medium text-white truncate">{user.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700/50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Cerrando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Cerrar sesión
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-4 md:p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Bienvenido, {user.given_name || user.name}
                    </h2>
                </div>

                {/* Chat Interface */}
                <div className="h-[calc(100vh-200px)]">
                    <ChatInterface user={user} />
                </div>

                {/* Info cards */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
                        <h3 className="font-medium text-white mb-2">🤖 DeepSeek R1</h3>
                        <p className="text-sm text-gray-400">
                            Modelo avanzado para respuestas inteligentes y detalladas.
                        </p>
                    </div>

                    <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl">
                        <h3 className="font-medium text-white mb-2">⚡ OpenRouter</h3>
                        <p className="text-sm text-blue-300">
                            Accede a múltiples modelos de AI a través de una sola API.
                        </p>
                    </div>

                    <div className="p-4 bg-cyan-600/10 border border-cyan-500/30 rounded-xl">
                        <h3 className="font-medium text-white mb-2">🔒 Sesión segura</h3>
                        <p className="text-sm text-cyan-300">
                            Tu sesión expira automáticamente en 24 horas.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;