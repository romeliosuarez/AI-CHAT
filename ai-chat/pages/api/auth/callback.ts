import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { setTokenCookie } from '@/lib/cookies';
import { createAuthToken, createUserFromGoogleInfo } from '@/lib/auth';
import { GoogleUserInfo } from '@/types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, error, error_description } = req.query;

    if (error) {
        console.error('Google OAuth error:', error, error_description);
        return res.redirect(`/login?error=${encodeURIComponent(error_description as string || error as string)}`);
    }

    if (!code) {
        return res.redirect('/login?error=No se recibió el código de autorización');
    }

    try {
        const tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token, id_token } = tokenResponse.data;

        const userInfoResponse = await axios.get<GoogleUserInfo>(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const userInfo = userInfoResponse.data;

        const user = createUserFromGoogleInfo(userInfo);
        const token = createAuthToken(user);

        setTokenCookie(res, token);

        res.writeHead(302, { Location: '/dashboard' });
        res.end();

    } catch (error: any) {
        console.error('Error in Google callback:', error.response?.data || error.message);

        let errorMessage = 'Error de autenticación';

        if (error.response?.data?.error === 'invalid_grant') {
            errorMessage = 'El código de autorización ha expirado. Por favor, intenta de nuevo.';
        } else if (error.response?.status === 400) {
            errorMessage = 'Solicitud inválida a Google';
        } else if (error.response?.status === 401) {
            errorMessage = 'Credenciales de Google inválidas';
        } else {
            errorMessage = error.response?.data?.error_description ||
                error.response?.data?.error ||
                error.message;
        }

        res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
}