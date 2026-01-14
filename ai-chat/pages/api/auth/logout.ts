import { NextApiRequest, NextApiResponse } from 'next';
import { removeTokenCookie } from '@/lib/cookies';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Método no permitido',
            message: 'Solo se permiten solicitudes POST'
        });
    }

    try {
        removeTokenCookie(res);

        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cerrar sesión'
        });
    }
}