/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // TU DOMINIO FINAL DE PRODUCCIÓN
  siteUrl: 'https://www.periodiconaranja.es', 
  generateRobotsTxt: true, // Genera también el robots.txt
  
  // Opcional: Si tienes muchas noticias (más de 5000), esto divide el sitemap
  sitemapSize: 7000,
  
  // IMPORTANTE: Excluir rutas internas de WP o administración si las hubiera
  exclude: ['/server-sitemap.xml', '/admin/*'], 
  
  robotsTxtOptions: {
    additionalSitemaps: [
      // Si decides usar sitemaps dinámicos más adelante para noticias en tiempo real
      // 'https://www.periodiconaranja.es/server-sitemap.xml',
    ],
  },
}