import { NextApiRequest, NextApiResponse } from 'next';
import { verifyOpenRouterKey } from '@/lib/openrouter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(200).json({
                status: 'error',
                message: 'OpenRouter API key no configurada',
                available: false
            });
        }

        const isKeyValid = await verifyOpenRouterKey(apiKey);

        res.status(200).json({
            status: isKeyValid ? 'operational' : 'error',
            available: isKeyValid,
            model: 'google/gemini-2.0-flash-exp:free',
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('Status check error:', error);
        res.status(200).json({
            status: 'error',
            available: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
}