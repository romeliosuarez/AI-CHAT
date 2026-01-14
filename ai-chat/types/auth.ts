export interface User {
    id: string;
    email: string;
    name: string;
    picture: string;
    given_name?: string;
    family_name?: string;
    locale?: string;
}

export interface Session {
    user: User;
    expires: number;
    issuedAt: any;
}

export interface GoogleUserInfo {
    sub: string;
    email: string;
    name: string;
    picture: string;
    given_name?: string;
    family_name?: string;
    locale?: string;
    email_verified?: boolean;
}

export interface AuthResponse {
    user: User;
    token: string;
    expiresAt: number;
}

export interface LoginResponse {
    success: boolean;
    user?: User;
    error?: string;
}

export interface SessionResponse {
    authenticated: boolean;
    user?: User;
    expires?: number;
    message?: string;
}