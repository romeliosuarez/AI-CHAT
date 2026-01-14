import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
        console.error('Missing Google OAuth environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    const params = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
    };

    Object.entries(params).forEach(([key, value]) => {
        googleAuthUrl.searchParams.set(key, value);
    });

    res.redirect(googleAuthUrl.toString());
}