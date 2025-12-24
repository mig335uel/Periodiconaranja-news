export interface YoastHeadJson {
    title: string;
    description?: string;
    robots?: {
        index: string;
        follow: string;
        "max-snippet": string;
        "max-image-preview": string;
        "max-video-preview": string;
    };
    canonical: string;
    og_locale: string;
    og_type: string;
    og_title: string;
    og_description?: string;
    og_url: string;
    og_site_name: string;
    article_publisher?: string;
    article_published_time?: string;
    article_modified_time?: string;
    og_image?: {
        width: number;
        height: number;
        url: string;
        type?: string;
    }[];
    author?: string;
    twitter_card: string;
    twitter_creator?: string;
    twitter_site: string;
    twitter_misc?: Record<string, string>;
    schema: {
        "@context": string;
        "@graph": any[];
    };
}

export interface Author {
    id: number;
    name: string;
    url: string;
    description: string;
    link: string;
    slug: string;
    avatar_urls: Record<string, string>;
    um_avatar_url: string;
    yoast_head_json: YoastHeadJson;
    _links: any;
}

export interface Category {
    id: number;
    count: number;
    description: string;
    link: string;
    name: string;
    slug: string;
    taxonomy: string;
    parent: number;
    yoast_head_json: YoastHeadJson;
    _links: any;
}

export interface Post {
    id: number;
    date: string;
    date_gmt?: string;
    guid?: { rendered: string };
    modified?: string;
    modified_gmt?: string;
    slug: string;
    status?: string;
    type: string;
    link?: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
        protected?: boolean;
    };
    excerpt: {
        rendered: string;
        protected?: boolean;
    };
    author: Author;
    featured_media?: number;
    comment_status?: string;
    ping_status?: string;
    sticky?: boolean;
    template?: string;
    format?: string;
    meta?: any;
    categories: Category[];
    tags?: number[];
    yoast_head_json: YoastHeadJson;
    jetpack_featured_media_url: string;
    _links?: any;
    election_data?: any;
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