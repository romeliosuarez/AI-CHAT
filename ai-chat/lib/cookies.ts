import { serialize, parse } from 'cookie';
import { IncomingMessage } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';

const TOKEN_NAME = 'auth_token';
const MAX_AGE = 24 * 60 * 60; // 24 horas

export function setTokenCookie(res: NextApiResponse, token: string): void {
    const cookie = serialize(TOKEN_NAME, token, {
        maxAge: MAX_AGE,
        expires: new Date(Date.now() + MAX_AGE * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    });

    res.setHeader('Set-Cookie', cookie);
}

export function removeTokenCookie(res: NextApiResponse): void {
    const cookie = serialize(TOKEN_NAME, '', {
        maxAge: -1,
        path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
}

export function parseCookies(req: NextApiRequest | IncomingMessage): Record<string, string> {
    if ('cookies' in req && req.cookies) {
        return req.cookies;
    }

    const cookie = req.headers?.cookie;
    return parse(cookie || '');
}

export function getTokenCookie(req: NextApiRequest | IncomingMessage): string | undefined {
    const cookies = parseCookies(req);
    return cookies[TOKEN_NAME];
}