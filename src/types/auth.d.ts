export interface TokenPayload {
    id: string;
    email: string;
    role?: string;
    [key: string]: any;
}