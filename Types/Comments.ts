import { Author, Post } from "./Posts";
import {User} from "./Account";
export interface Comentarios {
    id: string;
    user_id?: string | null;
    user?: User;
    post_id: number;
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
    users?: User;
    post_id: number;
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