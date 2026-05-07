/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Noticia from "@/components/ui/Noticia";
import NoticiasPorCategoria from "@/components/ui/NoticiasPorCategoria";
import { Post } from "@/Types/Posts";

interface Props {
  params: Promise<{
    slug: string[];
  }>;
}

// ─── Query GraphQL ────────────────────────────────────────────────────────────
const POST_QUERY = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      date
      modified
      slug
      excerpt
      content
      status

      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }

      author {
        node {
          name
          slug
          avatar {
            url
          }
        }
      }

      categories {
        nodes {
          name
          slug
          databaseId
        }
      }

      tags {
        nodes {
          name
          slug
        }
      }

      seo {
        title
        metaDesc
        opengraphTitle
        opengraphDescription
        opengraphImage {
          sourceUrl
          mediaDetails {
            width
            height
          }
        }
        twitterTitle
        twitterDescription
        twitterImage {
          sourceUrl
        }
        opengraphPublishedTime
        opengraphModifiedTime
        opengraphAuthor
      }
    }
  }
`;

// ─── Tipos GraphQL ────────────────────────────────────────────────────────────
interface WPPost {
  id: string;
  databaseId: number;
  title: string;
  date: string;
  modified: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails: { width: number; height: number };
    };
  };
  author: {
    node: {
      name: string;
      slug: string;
      avatar?: { url: string };
    };
  };
  categories: {
    nodes: Array<{ name: string; slug: string; databaseId: number }>;
  };
  tags: {
    nodes: Array<{ name: string; slug: string }>;
  };
  seo?: {
    title?: string;
    metaDesc?: string;
    opengraphTitle?: string;
    opengraphDescription?: string;
    opengraphImage?: {
      sourceUrl: string;
      mediaDetails: { width: number; height: number };
    };
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: { sourceUrl: string };
    opengraphPublishedTime?: string;
    opengraphModifiedTime?: string;
    opengraphAuthor?: string;
  };
}

// ─── Fetch con GraphQL ────────────────────────────────────────────────────────
async function fetchPost(slug: string): Promise<WPPost | null> {
  try {
    const res = await fetch(
      `${process.env.CMS_URL}/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: POST_QUERY,
          variables: { slug },
        }),
        next: {
          tags: [`post-${slug}`, "all-posts"],
        },
      }
    );

    if (!res.ok) return null;

    const { data, errors } = await res.json();

    if (errors?.length) {
      console.error("GraphQL errors:", errors);
      return null;
    }

    return data?.post ?? null;
  } catch (error) {
    console.error("Error fetching post via GraphQL:", error);
    return null;
  }
}

// ─── Adapter: WPPost → Post (tu tipo existente) ───────────────────────────────
// Esto permite que tus componentes <Noticia> y demás no necesiten cambios
function adaptPost(wp: WPPost): Post {
  return {
    ...wp,
    // Compatibilidad con tu tipo Post existente
    title: { rendered: wp.title },
    excerpt: { rendered: wp.excerpt },
    content: { rendered: wp.content },
    // Author aplanado como espera tu componente
    author: {
      name: wp.author.node.name,
      slug: wp.author.node.slug,
      avatar_urls: wp.author.node.avatar
        ? { "96": wp.author.node.avatar.url }
        : undefined,
    },
    // Categories aplanadas
    categories: wp.categories.nodes,
    // Featured media
    jetpack_featured_media_url: wp.featuredImage?.node.sourceUrl ?? "",
    // Yoast shape para compatibilidad con generateMetadata
    yoast_head_json: wp.seo
      ? {
          title: wp.seo.title,
          description: wp.seo.metaDesc,
          og_title: wp.seo.opengraphTitle,
          og_description: wp.seo.opengraphDescription,
          og_image: wp.seo.opengraphImage
            ? [
                {
                  url: wp.seo.opengraphImage.sourceUrl,
                  width: wp.seo.opengraphImage.mediaDetails?.width,
                  height: wp.seo.opengraphImage.mediaDetails?.height,
                },
              ]
            : undefined,
          twitter_creator: "@periodiconrja",
          author: wp.seo.opengraphAuthor,
        }
      : undefined,
  } as unknown as Post;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug.length === 0) return { title: "Página no encontrada" };

  const lastSegment = slug[slug.length - 1].replace(/\.html$/, "");
  const wpPost = await fetchPost(lastSegment);

  if (wpPost) {
    const post = adaptPost(wpPost);

    // Reemplazar URL interna del CMS por la pública
    const ogImageUrl = wpPost.seo?.opengraphImage?.sourceUrl
      ?.replace(process.env.CMS_URL ?? "", "https://periodiconaranja.es")
      ?? wpPost.featuredImage?.node.sourceUrl;

    return {
      title: wpPost.seo?.title || wpPost.title,
      description: wpPost.seo?.metaDesc || wpPost.excerpt.replace(/<[^>]*>?/gm, ""),
      robots: { follow: true, index: true },
      openGraph: {
        title: wpPost.seo?.opengraphTitle || wpPost.title,
        description: wpPost.seo?.opengraphDescription,
        images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
        type: "article",
        publishedTime: wpPost.date,
        modifiedTime: wpPost.modified,
        authors: [wpPost.author.node.name || "Periodico Naranja"],
      },
      twitter: {
        title: wpPost.seo?.twitterTitle || wpPost.title,
        description: wpPost.seo?.twitterDescription,
        images: wpPost.seo?.twitterImage?.sourceUrl
          ? [wpPost.seo.twitterImage.sourceUrl]
          : ogImageUrl
          ? [ogImageUrl]
          : undefined,
        card: "summary_large_image",
        site: "@periodiconrja",
        creator: "@periodiconrja",
      },
    };
  }

  // Categoría
  const categoryName =
    lastSegment.charAt(0).toUpperCase() +
    lastSegment.slice(1).replace(/-/g, " ");

  return {
    title: `${categoryName} | Periódico Naranja`,
    description: `Noticias y artículos sobre ${categoryName}`,
    robots: { follow: true, index: true },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page({ params }: Props) {
  const { slug } = await params;

  if (!slug || slug.length === 0) notFound();

  const lastSegment = slug[slug.length - 1].replace(/\.html$/, "");
  console.log("Dynamic Page Slug:", lastSegment);

  const wpPost = await fetchPost(lastSegment);

  if (wpPost) {
    const post = adaptPost(wpPost);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: wpPost.seo?.title || wpPost.title,
      image: [
        wpPost.seo?.opengraphImage?.sourceUrl ||
          wpPost.featuredImage?.node.sourceUrl,
      ],
      datePublished: wpPost.date,
      dateModified: wpPost.modified,
      author: [
        {
          "@type": "Person",
          name: wpPost.author.node.name || "Periodico Naranja",
          url: `https://periodiconaranja.es/author/${wpPost.author.node.slug}`,
        },
      ],
      publisher: {
        "@type": "Organization",
        name: "Periodico Naranja",
        logo: {
          "@type": "ImageObject",
          url: "https://periodiconaranja.es/Logo.png",
        },
      },
      description:
        wpPost.seo?.metaDesc ||
        wpPost.excerpt.replace(/<[^>]*>?/gm, ""),
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Noticia post={post as Post} cmsUrl={process.env.CMS_URL} />
      </>
    );
  }

  // Categoría
  const categoryName =
    lastSegment.charAt(0).toUpperCase() +
    lastSegment.slice(1).replace(/-/g, " ");

  const sectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryName,
    description: `Noticias y artículos sobre ${categoryName}`,
    url: `https://periodiconaranja.es/${lastSegment}`,
    publisher: {
      "@type": "Organization",
      name: "Periodico Naranja",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sectionJsonLd) }}
      />
      <NoticiasPorCategoria slug={lastSegment} />
    </>
  );
}