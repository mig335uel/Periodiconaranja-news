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

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PartidoResult {
  siglas: string;
  escanos: number;
  color: string;
  ideologia: string;
}

interface ElectionData {
  hasChart: boolean;
  data2025?: PartidoResult[];
  data2023?: PartidoResult[];
}

interface WPPost {
  databaseId: number;
  title: string;
  date: string;
  modified: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  isBreaking: boolean;
  isLiveBlog: boolean;
  featuredImage?: {
    node: {
      mediaItemUrl: string;      // mismo campo que usa Flutter
      altText: string;
      mediaDetails?: { width: number; height: number };
    };
  };
  author: {
    node: {
      databaseId: number;
      name: string;
      slug: string;
      avatar?: { url: string };
    };
  };
  categories: {
    nodes: Array<{
      databaseId: number;
      name: string;
      slug: string;
    }>;
  };
  tags: {
    nodes: Array<{ name: string; slug: string }>;
  };
  electionData?: ElectionData | null;
  seo?: {
    title?: string;
    metaDesc?: string;
    opengraphTitle?: string;
    opengraphDescription?: string;
    opengraphImage?: {
      sourceUrl: string;
      mediaDetails?: { width: number; height: number };
    };
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: { sourceUrl: string };
    opengraphAuthor?: string;
  };
}

// ─── Query — mismos campos que Flutter más SEO y campos extra de web ──────────

const POST_QUERY = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      databaseId
      title
      date
      modified
      slug
      excerpt
      content
      status

      # Campos custom — igual que Flutter
      isBreaking
      isLiveBlog

      featuredImage {
        node {
          mediaItemUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }

      author {
        node {
          databaseId
          name
          slug
          avatar {
            url
          }
        }
      }

      categories {
        nodes {
          databaseId
          name
          slug
        }
      }

      tags {
        nodes {
          name
          slug
        }
      }

      # Campo ACF — igual que Flutter
      electionData {
        hasChart
        data2025 {
          siglas
          escanos
          color
          ideologia
        }
        data2023 {
          siglas
          escanos
          color
          ideologia
        }
      }

      # SEO — solo web, Flutter no lo usa
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
        opengraphAuthor
      }
    }
  }
`;

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchPost(slug: string): Promise<WPPost | null> {
  try {
    const res = await fetch(`${process.env.CMS_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: POST_QUERY,
        variables: { slug },
      }),
      next: { tags: [`post-${slug}`, "all-posts"] },
    });

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

// ─── Adapter → tu tipo Post existente ────────────────────────────────────────
// Ajusta los campos del objeto según lo que espere tu componente <Noticia>

function adaptPost(wp: WPPost): Post {
  return {
    ...wp,
    id: wp.databaseId,
    title: { rendered: wp.title },
    excerpt: { rendered: wp.excerpt },
    content: { rendered: wp.content },
    // Author aplanado — databaseId igual que Flutter
    author: {
      id: wp.author.node.databaseId,
      name: wp.author.node.name,
      slug: wp.author.node.slug,
      avatar_urls: wp.author.node.avatar
        ? { "96": wp.author.node.avatar.url }
        : undefined,
    },
    // Categories con databaseId — misma shape que Flutter
    categories: wp.categories.nodes.map((c) => ({
      id: c.databaseId,
      name: c.name,
      slug: c.slug,
    })),
    // Featured image — mediaItemUrl igual que Flutter
    jetpack_featured_media_url: wp.featuredImage?.node.mediaItemUrl ?? "",
    // Campos custom
    isBreaking: wp.isBreaking ?? false,
    isLiveBlog: wp.isLiveBlog ?? false,
    election_data: wp.electionData
      ? {
          has_chart: wp.electionData.hasChart,        // REST usa snake_case
          data2025: wp.electionData.data2025 ?? [],
          data2023: wp.electionData.data2023 ?? [],
        }
      : null,
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
    const ogImageUrl =
      wpPost.seo?.opengraphImage?.sourceUrl?.replace(
        process.env.CMS_URL ?? "",
        "https://periodiconaranja.es"
      ) ?? wpPost.featuredImage?.node.mediaItemUrl;

    return {
      title: wpPost.seo?.title || wpPost.title,
      description:
        wpPost.seo?.metaDesc || wpPost.excerpt.replace(/<[^>]*>?/gm, ""),
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
        images:
          wpPost.seo?.twitterImage?.sourceUrl
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
  const wpPost = await fetchPost(lastSegment);

  if (wpPost) {
    const post = adaptPost(wpPost);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: wpPost.seo?.title || wpPost.title,
      image: [
        wpPost.seo?.opengraphImage?.sourceUrl ||
          wpPost.featuredImage?.node.mediaItemUrl,
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