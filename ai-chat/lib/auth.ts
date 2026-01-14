import jwt from 'jsonwebtoken';
import { User, Session, GoogleUserInfo } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET;

export function createAuthToken(user: User): string {
    const expiresIn = '24h';
    const payload = {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            given_name: user.given_name,
            family_name: user.family_name,
            locale: user.locale,
        },
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(
        payload,
        JWT_SECRET,
        { algorithm: 'HS256' }
    );

    return token;
}

export function verifyAuthToken(token: string): Session | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            user: User;
            exp: number;
            iat: number;
        };

        if (decoded.exp * 1000 < Date.now()) {
            return null;
        }

        return {
            user: decoded.user,
            expires: decoded.exp * 1000,
            issuedAt: decoded.iat * 1000,
        };
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

export function createUserFromGoogleInfo(info: GoogleUserInfo): User {
    return {
        id: info.sub,
        email: info.email,
        name: info.name,
        picture: info.picture,
        given_name: info.given_name,
        family_name: info.family_name,
        locale: info.locale,
    };
}