import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/session');
                const data = await response.json();

                if (data.authenticated) {
                    router.push('/dashboard');
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/login');
            }
        };

        checkAuth();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="mt-4 text-gray-300">Redirigiendo...</p>
            </div>
        </div>
    );
}