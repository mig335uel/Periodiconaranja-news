//import NewsEditor from "@/components/TipTapEditor";

// import { createClient } from "@/lib/supabase/client";
import MainPage from "@/components/ui/MainPage";
import { Post, PostsNode } from "@/Types/Posts";



export default async function Home() {
  const query = `{
    posts(first: 25) {
      nodes {
        databaseId
        title
        date
        excerpt(format: RENDERED)
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
        slug
        categories {
          nodes {
            databaseId
            name
            slug
          }
        }
        featuredImage {
          node {
            link
          }
        }
      }
    }
  }`;

  const response = await fetch(`${process.env.CMS_URL}/graphql`, { next: { revalidate: 15 }, cache: 'no-cache', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: query }) });

  if (!response.ok) {
    throw new Error(`WordPress API returned ${response.status}`);
  }
  const data = await response.json();
  console.log(data);
  const posts: PostsNode[] = data.data.posts.nodes;
  /* if (!Array.isArray(posts)) {
    throw new Error('Expected posts to be an array');
  }

  // Collect unique category IDs from posts
  const categoryIds = Array.from(new Set(posts.flatMap((p: any) => Array.isArray(p.categories) ? p.categories : []))).filter(Boolean);
  let categories: any[] = [];
  if (categoryIds.length > 0) {
    const categoriesResponse = await fetch(`${process.env.CMS_URL}/wp-json/wp/v2/categories?include=` + categoryIds.join(',') + '&per_page=100');
    if (!categoriesResponse.ok) {
      throw new Error(`WordPress categories API returned ${categoriesResponse.status}`);
    }
    const categoriesJson = await categoriesResponse.json();
    categories = Array.isArray(categoriesJson) ? categoriesJson : [categoriesJson];
  }

  // Collect unique author IDs from posts
  const authorIds = Array.from(new Set(posts.map((p: any) => p.author).filter(Boolean)));
  let authors: any[] = [];
  if (authorIds.length > 0) {
    const authorsResponse = await fetch(`${process.env.CMS_URL}/wp-json/wp/v2/users?include=` + authorIds.join(','));
    if (!authorsResponse.ok) {
      throw new Error(`WordPress authors API returned ${authorsResponse.status}`);
    }
    const authorsJson = await authorsResponse.json();
    authors = Array.isArray(authorsJson) ? authorsJson : [authorsJson];
  }

  // Map embedded data to match Post interface
  const mappedPosts: Post[] = posts.map((post: any) => ({
    ...post,
    author: authors.find((a: any) => a.id === post.author) || null,
    categories: Array.isArray(post.categories) ? categories.filter((c: any) => post.categories.includes(c.id)) : [],
    // Ensure jetpack_featured_media_url fallback if needed, or rely on it being present
  })); */
  return (
    <>
      <MainPage posts={posts} />
    </>

  );
}
