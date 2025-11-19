export interface Comentarios{
    id: string;
    user_id: string | null;
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