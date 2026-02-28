"use client";
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { use, useEffect, useMemo, useState, useCallback } from "react";
import type { Post } from "@/Types/Posts";
import Link from "next/link";
import "./Noticia.scss";
import ComentariosEditor from "@/components/ComentariosEditor";
import Header from "@/app/Header";
import type { Comentarios } from "@/Types/Comments";
import { useAuth } from "@/hooks/useAuth";
import Footer from "../Footer";

import JWPlayer from "../JWPlayer";
// import NewsViewer from "@/components/NewsViewer";
import parse, { domToReact, Element, HTMLReactParserOptions } from 'html-react-parser';
import EscrutinioWidget from "../Escrutinio";
import { RegionData } from "@/Types/Elecciones";
import { Tweet } from 'react-tweet';
import { InstagramEmbed, TikTokEmbed, XEmbed } from 'react-social-media-embed';
import LiveUpdates from "../LiveUpdates";
import AdBanner from "../AdBanner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// ----------------------------------------------------------------------
// 1. HELPER: EXTRACTOR DE DATOS (API + FALLBACK HTML)
// ----------------------------------------------------------------------
const getElectionDataFromPost = (post: any, htmlContent: string): RegionData | null => {
  try {
    // A) INTENTO VÍA API (Prioritario: Lo que envía el nuevo plugin)
    // Buscamos 'electionData' (GraphQL) o 'election_data' (REST)
    const apiData = post.electionData || post.election_data;

    if (apiData) {
      // Detectamos si es Aragón para ajustar las matemáticas electorales
      const isAragon = apiData.name === 'Aragón';

      // Obtenemos la lista de partidos (puede venir como data2025 o data_2025 según la API)
      const currentData = apiData.data2025 || apiData.data_2025 || [];

      // Si la API devuelve error o datos vacíos, pasamos al fallback HTML
      if (apiData.error || !currentData || currentData.length === 0) {
        console.warn("Datos API vacíos o con error, intentando fallback HTML...");
      } else {
        return {
          nombre: apiData.name || 'Elecciones',
          escrutado: apiData.escrutado || '0%',
          // Ajuste dinámico de mayoría y escaños totales
          mayoria: isAragon ? 34 : 33,
          total_dip: isAragon ? 67 : 65,
          partidos: currentData
        };
      }
    }

    // B) FALLBACK: INTENTO VÍA HTML (Regex antiguo para Extremadura)
    const jsonMatch = htmlContent.match(/const data25 = (\[.*?\]);/s);
    if (jsonMatch && jsonMatch[1]) {
      const partidos = JSON.parse(jsonMatch[1]);
      const escrutadoMatch = htmlContent.match(/Escrutado: <strong>(.*?)<\/strong>/);
      const escrutado = escrutadoMatch ? escrutadoMatch[1] : '100%';
      const mayoriaMatch = htmlContent.match(/Mayoría: (\d+)/);
      const mayoria = mayoriaMatch ? parseInt(mayoriaMatch[1]) : 33;

      return {
        nombre: 'Extremadura',
        escrutado: escrutado,
        mayoria: mayoria,
        total_dip: 65,
        partidos: partidos
      };
    }

    return null;
  } catch (e) {
    console.error("Error procesando datos electorales:", e);
    return null;
  }
};

// Helper para buscar elementos por nombre de etiqueta (recursivo)
const findElementsByTagName = (node: Element, tagName: string): Element[] => {
  let results: Element[] = [];
  if (node.children) {
    node.children.forEach((child) => {
      if (child instanceof Element) {
        if (child.name === tagName) {
          results.push(child);
        }
        results = results.concat(findElementsByTagName(child, tagName));
      }
    });
  }
  return results;
};

// Componente CommentTree modificado
function CommentTree({
  comments,
  onReply,
  onDelete,
}: {
  comments: Comentarios[];
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}) {
  // 1. PROTECCIÓN: Si comments es undefined o null, no renderizamos nada para evitar errores.
  const { user } = useAuth();
  if (!comments || comments.length === 0) return null;
  return (
    <div className="comment-tree space-y-4">
      {" "}
      {/* space-y-4 añade separación entre comentarios raíz */}
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="border border-gray-100 last:border-0 py-4 "
        >
          <div className="flex justify-between items-start gap-4 comment-div">
            {" "}
            {/* gap-4 evita que el botón pegue con el texto */}
            <div className="flex-1 ">
              {/* Nombre del comentarista (si no está autenticado, usar anonymous_name) */}
              {comment.user?.image &&
                comment.user?.image !== "NULL" &&
                comment.user?.image !== "null" ? (
                <div className="flex flex-row items-center gap-2">
                  <div className="w-6 h-6 rounded-full relative flex items-center justify-center">
                    <img
                      src={comment.user?.image}
                      className="w-6 h-6 object-cover rounded-full"
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {comment.anonymous_name ||
                      (comment.user
                        ? (comment.user.display_name ? `${comment.user.display_name}` : `${comment.user.name} ${comment.user.last_name}`)
                        : comment.user_id
                          ? "Usuario Registrado"
                          : "Anónimo")}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-700">
                  {comment.anonymous_name ||
                    (comment.user
                      ? (comment.user.display_name ? `${comment.user.display_name}` : `${comment.user.name} ${comment.user.last_name}`)
                      : comment.user_id
                        ? "Usuario Registrado"
                        : "Anónimo")}
                </p>
              )}

              <p
                className="text-gray-800 mb-2 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              ></p>
              <p className="text-xs text-orange-500">
                {(new Date(comment.created_at).getTime() > new Date().getTime() - 24 * 60 * 60 * 1000) ? new Date(comment.created_at).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) : new Date(comment.created_at).toLocaleDateString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {
              // Lógica de visualización de botones Responder/Eliminar
              user !== null && (user.role === "admin" || user.role === "editor" || user.id === comment.user_id) ? (
                <div className="buttomComments flex space-x-2">
                  <button
                    type="button"
                    onClick={() => onReply(comment.id)}
                    className="shrink-0 px-3 py-1 text-sm text-blue-600 rounded transition font-medium hover:bg-blue-600 hover:text-white border border-blue-600"
                  >
                    Responder
                  </button>
                  <button
                    type="button"
                    // CORREGIDO: Llama a onDelete(comment.id) directamente.
                    onClick={() => onDelete(comment.id)}
                    className="shrink-0 px-3 py-1 text-sm text-red-600 rounded transition font-medium hover:bg-red-600 hover:text-white border border-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onReply(comment.id)}
                  className="shrink-0 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition font-medium"
                >
                  Responder
                </button>
              )
            }
          </div>

          {/* Si hay respuestas, mostrarlas anidadas */}
          {comment.replies && comment.replies.length > 0 && (
            // 2. RESPONSIVE: Usamos pl-3 en móvil y md:pl-6 en PC para no perder espacio en pantallas pequeñas
            <div className="ml-2 mt-3 pl-3 md:ml-6 md:pl-4 border-l-2 border-orange-200">
              {/* PASAR onDelete en la llamada recursiva */}
              <CommentTree
                comments={comment.replies}
                onReply={onReply}
                onDelete={onDelete}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Función auxiliar para convertir lista plana a árbol
const buildCommentTree = (flatComments: Comentarios[] | null | undefined) => {
  // Protección adicional para garantizar que el argumento sea un array
  const safeComments = Array.isArray(flatComments) ? flatComments : [];

  const map = new Map();
  const roots: any[] = [];

  // 1. Inicializar mapa y array de respuestas
  safeComments.forEach((comment) => {
    // Creamos una copia y añadimos 'replies' vacío
    map.set(comment.id, { ...comment, replies: [] });
  });

  // 2. Construir relaciones
  safeComments.forEach((comment) => {
    const node = map.get(comment.id);
    if (comment.parent_id) {
      const parent = map.get(comment.parent_id);
      // Solo añadimos si el padre existe (para evitar errores con datos huérfanos)
      if (parent) {
        parent.replies.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Opcional: Ordenar por fecha (más nuevos primero o al revés)
  return roots.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export default function Noticia_Precargada({ post, cmsUrl }: { post: Post | any; cmsUrl?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<Comentarios[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [imagenesCarrusel, setImagenesCarrusel] = useState<string[]>([]);
  console.log("Rendering Noticia_Precargada for post ID:", post);
  // useMemo depende de comentarios, se actualizará al cambiar el estado de los comentarios
  const comentariosArbol = useMemo(() => {
    return buildCommentTree(comentarios);
  }, [comentarios]);

  // Función para manejar la respuesta
  const handleReply = useCallback(
    (commentId: string) => {
      setReplyingTo(commentId);
      // Scroll suave al editor de comentarios
      setTimeout(() => {
        document.getElementById("comment-editor")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    },
    [setReplyingTo]
  ); // Dependencias vacías

  // 1. Función de fetcheo de comentarios (usa useCallback)
  const fetchComentarios = useCallback(
    async (postId: number) => {
      if (!postId) return;
      try {
        const res = await fetch(`/api/comentarios/${postId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          // CORREGIDO: Se lee el JSON una sola vez
          const data = await res.json();

          setComentarios(data);
        } else {
          console.error("Error fetching comentarios, status:", res.status);
        }
      } catch (err: unknown) {
        console.error("Error fetching comentarios:", err);
      }
    },
    [setComentarios]
  ); // Depende de setComentarios

  // 2. Función de eliminación (usa useCallback, resuelve el problema de borrado y recarga)
  const handleDelete = useCallback(
    async (commentId: string) => {
      // Aseguramos que tenemos el ID del post para la recarga posterior
      if (!post?.id) {
        console.error("No se pudo obtener el ID del post para recargar.");
        return;
      }

      try {
        const res = await fetch(`/api/comentarios/${commentId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (res.ok) {
          // ¡BORRADO EXITOSO!
          console.log("Comentario borrado con éxito. Recargando lista...");
          await fetchComentarios(post?.id);
        } else {
          const errorData = await res.json();
          console.error("Error al borrar el comentario:", errorData);
        }
      } catch (e: unknown) {
        console.error("Error durante el proceso de borrado:", e);
      }
    },
    [post, fetchComentarios]
  ); // Depende de post y fetchComentarios

  // Función para cancelar respuesta
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Función para cuando se envía un comentario (para limpiar el estado de respuesta y recargar)
  const handleCommentSubmitted = useCallback(() => {
    setReplyingTo(null);
    // Recargar comentarios si es necesario
    if (post?.id) {
      fetchComentarios(post.id);
    }
  }, [post, fetchComentarios]);

  // CORRECCIÓN DEL BUCLE y MANEJO DE LÓGICA DE FETCH
  useEffect(() => {
    const fetchPostAndComments = async () => {
      let fetchedPostId: number | undefined;

      try {
        fetchedPostId = post.id; // Capturar el ID
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido.";
        console.error("Error fetching post:", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }

      // Llama a fetchComentarios AQUÍ, después de obtener el ID.
      if (fetchedPostId) {
        await fetchComentarios(fetchedPostId);
      }
    };

    fetchPostAndComments();
  }, [fetchComentarios]); // Depende de slug y fetchComentarios

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="text-gray-600 mt-4">Cargando artículo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg">
            {error || "Post no encontrado"}
          </p>
          <Link
            href="/"
            className="text-orange-600 hover:underline mt-4 inline-block"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );


  }
  const backendUrl = cmsUrl ? `${cmsUrl}/wp-content/uploads` : "https://cms.periodiconaranja.es/wp-content/uploads";
  // Nuestra URL "falsa" (Frontend)
  const maskedUrl = "/media";
  const contentToParse = post.content.rendered
    .replace(/\n+/g, "")
    .replaceAll(backendUrl, maskedUrl);

  // 2. Cortamos ese baseContent por los finales de párrafo

  const extractedElectionData = useMemo(() => {
    return getElectionDataFromPost(post, post.content.rendered);
  }, [post]);

  // 2. CONFIGURACIÓN DEL PARSER
  let paragraphCount = 0;
  const parserOption: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === 'p') {
        paragraphCount++;
        let isInsideBlockquote = false;
        let parent = domNode.parent;
        while (parent) {
          if ((parent as any).name === 'blockquote') {
            isInsideBlockquote = true;
            break;
          }
          parent = parent.parent;
        }
        // Si es el párrafo 3, 6, 9... inyectamos el anuncio
        if (paragraphCount % 2 === 0 && !isInsideBlockquote) {
          return (
            <>
              {/* 1. Pintamos el párrafo original con su texto intacto */}
              <p {...domNode.attribs}>
                {domToReact(domNode.children as any, parserOption)}
              </p>

              <AdBanner />
              {/* 2. Inyectamos el iframe del anuncio (sin romper el HTML) */}

            </>
          );
        }
      }
      if (domNode instanceof Element && domNode.attribs) {

        // A. DETECTAR EL DIV CONTENEDOR (Compatible con antiguo y nuevo plugin)
        if (domNode.attribs.class && (
          domNode.attribs.class.includes('post-elecc-container') ||
          domNode.attribs.class.includes('ea26-container')
        )) {
          // Si logramos extraer datos válidos (sea de API o HTML), mostramos el gráfico
          if (extractedElectionData) {
            return (
              <EscrutinioWidget election_data={extractedElectionData} />
            );
          }
          // Si no hay datos, ocultamos el bloque PHP
          return <></>;
        }


        // B. LIMPIAR BASURA (Scripts viejos y Estilos inline)
        if (domNode.name === 'script' && domNode.children && (domNode.children[0] as any)?.data) {
          const scriptData = (domNode.children[0] as any).data;
          // Limpiamos 'const data25' (antiguo) y 'ea26Canvas' (nuevo)
          if (scriptData.includes('const data25') || scriptData.includes('ea26Canvas') || scriptData.includes('chartjs')) {
            return <></>;
          }
        }
        if (domNode.name === 'style' && (domNode.children[0] as any)?.data) {
          const styleData = (domNode.children[0] as any).data;
          if (styleData.includes('.post-elecc-container') || styleData.includes('.ea26-container')) {
            return <></>;
          }
        }
        if (domNode.name === 'div' && (domNode.attribs.class.includes('wp-block-gallery') || domNode.attribs.class.includes('wp-block-jetpack-slideshow'))) {
          const images = findElementsByTagName(domNode, 'img');
          const imageUrls = images.map(img => img.attribs.src);
          // Omitimos setImagenesCarrusel(imageUrls) porque ocurre en render y fallaría en React.
          return (
            <div className="w-full max-w-md h-full max-md:max-w-sm mx-auto my-8 relative rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50">
              <Swiper
                spaceBetween={0}
                centeredSlides={true}
                effect={"fade"}
                fadeEffect={{ crossFade: true }}
                loop={true}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                className="w-full h-full"
              >
                {imageUrls.map((img, index) => (
                  <SwiperSlide key={index} className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )
        }


        // C. RESTO DE EMBEDS (Sin cambios)
        if (domNode.name === 'blockquote' && domNode.attribs.class?.includes('instagram-media')) {
          const links = findElementsByTagName(domNode, 'a');
          let instaUrl = null;

          for (const link of links) {
            const href = link.attribs.href;
            if (href && (href.includes('instagram.com') || href.includes('instagr.am'))) {
              instaUrl = href;
              break;
            }
          }
          if (instaUrl) {
            return (
              <div className="flex justify-center my-4">
                <InstagramEmbed url={instaUrl} width={328} />
              </div>
            );
          }
        }
        if (domNode.name === 'blockquote' && domNode.attribs.class?.includes('tiktok-embed')) {
          const tiktokUrl = domNode.attribs.cite;
          if (tiktokUrl) {
            return (
              <div className="flex justify-center my-4">
                <TikTokEmbed url={tiktokUrl} width={325} />
              </div>
            );
          }
        }
        if (domNode.name === 'blockquote' && domNode.attribs.class?.includes('twitter-tweet')) {
          const links = findElementsByTagName(domNode, 'a');
          let tweetId = null;

          for (const link of links) {
            const href = link.attribs.href;
            if (href && (href.includes('twitter.com') || href.includes('x.com')) && href.includes('/status/')) {
              const parts = href.split('/status/');
              // El ID es lo que va después de /status/, quitando posibles query params
              tweetId = parts[1].split('?')[0];
              break;
            }
          }
          if (tweetId) {
            return <>
              <div className="flex justify-center"><XEmbed url={`https://x.com/${tweetId}`} width={328 * 2} /></div><br />
            </>;
          }
        }
        if (domNode.name === 'div' && domNode.attribs.id?.startsWith('player_')) {
          return (
            <div className="mb-8">
              <JWPlayer
                videoId={`jw-${post.id}`}
                file={post.jwplayer_data?.file || ""}
                libraryUrl={"https://cdn.jwplayer.com/libraries/KB5zFt7A.js"}
                // Si tienes la imagen destacada, úsala como poster
                image={post.jetpack_featured_media_url || ""}
                licenseKey="6RfMdMqZkkH88h026pcTaaEtxNCWrhiF6ACoxKXjjiI"
              />
            </div>
          );
        }
        if (domNode.name === 'div' && domNode.attribs.class?.includes('anuncio-automatico')) {
          return <AdBanner />;
        }


      }
    }
  };

  // --- LÓGICA DE EXCERPT ---
  // Extraemos el texto puro del excerpt y del artículo (limpiando etiquetas HTML y espacios múltiples)
  const cleanExcerpt = post.excerpt?.rendered?.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() || '';
  const plainContent = post.content?.rendered?.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() || '';

  // Limpiamos los caracteres finales del excerpt que WordPress suele autogenerar como '...' o '[...]'
  const excerptForComparison = cleanExcerpt.replace(/\[&hellip;\]|&hellip;|\.\.\.$/g, '').trim();

  // Validamos: Si no hay texto o si el contenido NO empieza con el texto del excerpt,
  // damos la orden de mostrarlo en pantalla. Si coinciden exactamente, lo oculta.
  const showExcerpt = excerptForComparison.length === 0 || !plainContent.startsWith(excerptForComparison);

  return (
    <>
      <Header />
      <article className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Categorías */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="inline-block bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide hover:bg-orange-700 transition no-underline"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Título del artículo */}
          <h1 className="font-serif text-5xl font-bold text-gray-900 mb-10 leading-tight sm:text-4xl md:text-5xl lg:text-6xl max-md:text-center max-md:text-[30px] max-w-[500px]:text-[30px]">
            <div
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            ></div>
          </h1>

          {/* Metadata: Autor y Fecha */}

          {/* Imagen destacada */}
          {post.jetpack_featured_media_url && (
            <figure className="mb-10 -mx-4 md:mx-0">
              <div className="rounded-none md:rounded-lg overflow-hidden p-2">
                <img
                  src={post.jetpack_featured_media_url}
                  alt={post.title.rendered}
                  className="w-full h-auto object-cover max-md:h-[200px]"
                />
              </div>
              {/*post.excerpt && (
                <figcaption className="text-sm text-gray-600 italic mt-3 px-4 md:px-0">
                  <div dangerouslySetInnerHTML={{__html: post.excerpt.rendered}}></div>
                </figcaption>
              )}*/}
            </figure>
          )}
          {/* Contenido del artículo */}
          <div className="flex flex-warp justify-between items-center gap-6 text-gray-600 mb-8 pb-6 border-b-2 border-orange-200">
            {/* Autor */}
            <div className="flex items-center gap-3">
              {post.author?.um_avatar_url &&
                post.author?.um_avatar_url !== "NULL" &&
                post.author?.um_avatar_url !== "null" &&
                post.author?.um_avatar_url !==
                (cmsUrl ? `${cmsUrl}/wp-content/plugins/ultimate-member/assets/img/default_avatar.jpg` : "https://cms.periodiconaranja.es/wp-content/plugins/ultimate-member/assets/img/default_avatar.jpg") ? (
                <div className="w-12 h-12 rounded-full relative flex items-center justify-center">
                  <img
                    src={post.author?.um_avatar_url}
                    className="w-12 h-12 object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">
                  Por
                </p>
                <p className="font-semibold text-gray-900">
                  {post.author?.name || "Redacción"}{" "}
                </p>
              </div>
            </div>

            {/* Fecha de publicación */}
            <div className="flex items-center gap-3 ">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                {new Date(post.modified || post.date).getTime() -
                  new Date(post.date).getTime() >=
                  10 * 60 * 1000 ? (
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                        Publicado
                      </p>
                      <time
                        dateTime={post.date}
                        className="text-sm font-bold text-gray-900 leading-none block"
                      >
                        {new Date(post.date).toLocaleDateString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <div className="pt-1 border-t border-gray-100/50">
                      <p className="text-xs text-orange-600 font-medium uppercase tracking-wider mb-0.5">
                        Actualizado
                      </p>

                      <time
                        dateTime={post.modified || ""}
                        className="text-sm font-bold text-gray-800 leading-none block"
                      >
                        {new Date(post.modified || "").toLocaleDateString(
                          "es-ES",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </time>
                    </div>
                  </div>
                ) : (
                  <time
                    dateTime={post.date}
                    className="font-semibold text-gray-900"
                  >
                    {new Date(post.date).toLocaleDateString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
            {showExcerpt && (
              <h2 className="text-2xl font-bold mb-10 pb-2 text-justify md:text-justify leading-snug md:leading-normal hyphens-auto" lang="es">
                <div
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                ></div>
              </h2>
            )}

            <div
              className="article-content hyphens-auto" lang="es"
            // dangerouslySetInnerHTML={{
            //   __html: parserOption ? parse(cleanContent, parserOption) as string : cleanContent,
            // }}
            >{parse(contentToParse, parserOption)}</div>
            <hr className="my-4" />
            {post.isLiveBlog === true ? (
              <>

                <LiveUpdates postId={post.id} initialUpdates={post.live_updates} />
              </>
            ) : null}

            <div className="mt-10 pt-8  border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                {/* Compartir */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 font-semibold">Compartir:</span>
                  <Link href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.link)}`}>
                    <button
                      className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                      aria-label="Compartir en Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </button>
                  </Link>
                  <Link href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(post.link)}&text=${encodeURIComponent(post.title!.rendered)}`}>
                    <button
                      className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center hover:bg-sky-600 transition"
                      aria-label="Compartir en Twitter"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                      </svg>
                    </button>
                  </Link>
                  <Link href={`https://wa.me/?text=${encodeURIComponent(post.link)}`}>
                    <button
                      className="w-10 h-10 rounded-lg bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition"
                      aria-label="Compartir en WhatsApp"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </button>
                  </Link>


                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-4 bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition no-underline p-3 max-md:flex-1 max-md:justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver al inicio
                </Link>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">
                  Comentarios ({comentariosArbol.length})
                </h2>
                <CommentTree
                  comments={comentariosArbol}
                  onReply={handleReply}
                  onDelete={handleDelete} // <-- Pasamos handleDelete como prop
                />
              </div>

              <div className="mt-12 border-t pt-6" id="comment-editor">
                <h3 className="text-xl font-semibold mb-4">
                  {replyingTo
                    ? "Respondiendo al comentario..."
                    : "Publica tu Comentario"}
                </h3>

                {/* Banner indicador cuando se está respondiendo */}
                {replyingTo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex justify-between items-center">
                    <span className="text-blue-700 text-sm">
                      Estás respondiendo a un comentario.
                    </span>
                    <button
                      onClick={handleCancelReply}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Cancelar respuesta
                    </button>
                  </div>
                )}

                <ComentariosEditor
                  postId={post.id}
                  parentID={replyingTo}
                  onCommentSubmitted={handleCommentSubmitted}
                />
              </div>
            </div>
          </div>
        </div>

      </article>
      <Footer />
    </>
  );
}