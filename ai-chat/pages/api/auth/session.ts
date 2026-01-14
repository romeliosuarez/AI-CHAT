import { NextApiRequest, NextApiResponse } from 'next';
import { getTokenCookie } from '@/lib/cookies';
import { verifyAuthToken } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Método no permitido',
            message: 'Solo se permiten solicitudes GET'
        });
    }

    try {
        const token = getTokenCookie(req);

        if (!token) {
            return res.status(200).json({
                authenticated: false,
                message: 'No hay sesión activa'
            });
        }

        const session = verifyAuthToken(token);

        if (!session) {
            return res.status(200).json({
                authenticated: false,
                message: 'Sesión expirada o inválida'
            });
        }

        res.status(200).json({
            authenticated: true,
            user: session.user,
            expires: session.expires,
        });
    } catch (error) {
        console.error('Session check error:', error);
        res.status(500).json({
            authenticated: false,
            error: 'Error al verificar la sesión'
        });
    }
}