export interface User {
    id: string;
    name: string;
    last_name: string;
    email: string;
    password?: string;
    image?: string | null;
    role: string;
}
