export interface Author {
    id: string;
    name: string;
    last_name: string;
    email: string;
    role: string;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    author_id: string;
    author?: Author;
    excerpt?: string | null;
    featured_image?: string | null;
    categories?: Category[];
    created_at: string;
    is_published: boolean;
    published_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface PostCategory {
    post_id: string;
    category_id: string;
}

export interface CreatePostData {
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    categoryIds: string[];
    authorId: string;
    featuredImage?: string | null;
}
