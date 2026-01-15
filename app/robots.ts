import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/adminPanel/', '/server-sitemap.xml'],
        },
        sitemap: 'https://www.periodiconaranja.es/sitemap.xml',
    };
}
