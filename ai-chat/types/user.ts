export interface User {
    id: string;
    email: string;
    name: string;
    picture: string;
    given_name?: string;
    family_name?: string;
    locale?: string;
}