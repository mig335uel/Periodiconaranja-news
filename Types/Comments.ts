import { Author, Post } from "./Posts";

export interface Comentarios {
    id: string;
    user_id?: string | null;
    user?: Author;
    post_id: string;
    parent_id?: string | null;
    content: string;
    anonymous_name?: string | null;
    anonymous_email?: string | null;
    status: 'approved' | 'pending' | 'spam';
    created_at: string;
    updated_at: string;
    replies?: Comentarios[];
}
export interface ComentariosAdminModule {
    id: string;
    user_id?: string | null;
    users?: Author;
    post_id: string;
    posts?: Post;
    parent_id?: string | null;
    content: string;
    anonymous_name?: string | null;
    anonymous_email?: string | null;
    status: 'approved' | 'pending' | 'spam';
    created_at: string;
    updated_at: string;
    replies?: Comentarios[];
}