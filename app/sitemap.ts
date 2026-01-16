import { MetadataRoute } from 'next';

// Esta función busca tus noticias recientes de WP para ponerlas en el sitemap
async function getNoticiasSitemap() {
    let allPosts: any[] = [];
    let page = 1;
    const res = await fetch(`${process.env.CMS_URL}/wp-json/wp/v2/posts?per_page=1000&_fields=slug,modified`);

        if (!res.ok) {
            // Si la respuesta no es OK (ej. 400 cuando te pasas de página), salimos
            return [];
        }

        const posts = await res.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            return [];
        }

        allPosts.push(...posts);
        return allPosts;
    }



export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const noticias = await getNoticiasSitemap();

    // Rutas estáticas base
    const rutasBase = [
        {
            url: 'https://www.periodiconaranja.es',
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 1,
        },
        {
            url: 'https://www.periodiconaranja.es/login',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: 'https://www.periodiconaranja.es/noticias',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: 'https://www.periodiconaranja.es/busqueda',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: 'https://www.periodiconaranja.es/categories',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: 'https://www.periodiconaranja.es/elecciones',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ];

    return [...rutasBase, ...noticias];
}