import { NextApiRequest, NextApiResponse } from 'next';
import { getTokenCookie } from '@/lib/cookies';
import { verifyAuthToken } from '@/lib/auth';
import { getDeepSeekResponse } from '@/lib/openrouter';
import { ChatRequest } from '@/types/chat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Método no permitido',
            message: 'Solo se permiten solicitudes POST'
        });
    }

    try {
        const token = getTokenCookie(req);
        const session = token ? verifyAuthToken(token) : null;

        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'No autorizado',
                message: 'Por favor inicia sesión para usar el chat'
            });
        }

        const { message, history = [] }: ChatRequest = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Mensaje inválido',
                message: 'El mensaje no puede estar vacío'
            });
        }

        if (message.length > 4000) {
            return res.status(400).json({
                success: false,
                error: 'Mensaje demasiado largo',
                message: 'El mensaje debe tener menos de 4000 caracteres'
            });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error('OpenRouter API key no configurada');
            return res.status(500).json({
                success: false,
                error: 'Error de configuración',
                message: 'El servicio de chat no está disponible en este momento'
            });
        }

        const startTime = Date.now();
        const deepseekResponse = await getDeepSeekResponse(message.trim(), history, apiKey);
        const processingTime = Date.now() - startTime;

        deepseekResponse.processing_time = processingTime;

        console.log(`Chat request from ${session.user.email}:`, {
            messageLength: message.length,
            model: deepseekResponse.model,
            tokens: deepseekResponse.tokens_used,
            processingTime,
        });

        res.status(200).json({
            success: true,
            ...deepseekResponse,
            user: {
                id: session.user.id,
                name: session.user.name,
            }
        });

    } catch (error: any) {
        console.error('Chat API error:', error);

        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'Hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}