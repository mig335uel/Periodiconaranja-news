"use client";

import React from "react";
import Link from "next/link";
// Importamos Swiper y sus estilos
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import type { Post, PostsNode } from "@/Types/Posts";

// Estilos de Swiper obligatorios
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { buildCategoryNodePath, buildCategoryPath } from "@/lib/utils";

export default function HeroSlider({ posts }: { posts: PostsNode[] }) {
  // Si no hay posts, no renderizamos nada
  if (!posts || posts.length === 0) return null;

  // Función auxiliar para limpiar texto (la misma que tenías en MainPage)
  const getExcerpt = (content: string = "", maxLength: number = 150) => {
    let text = content.replace(/<[^>]*>/g, "");
    text = text.replace(/[\r\n\t]+/g, " ");
    text = text.replace(/\s+/g, " ").trim();
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] relative group rounded-lg overflow-hidden shadow-2xl border-4 border-gray-200 mb-8">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        effect={"fade"}
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
        {posts.map((post) => (
          <SwiperSlide
            key={post.databaseId}
            className="relative w-full h-full bg-gray-900"
          >
            {/* Imagen de fondo */}
            <div className="relative w-full h-full">
              <img
                src={
                  post.featuredImage.node.mediaItemUrl||
                  "https://via.placeholder.com/1200x600"
                }
                alt={post.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500"
              />
              {/* Overlay oscuro para leer mejor el texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* Contenido (Texto sobre la imagen) */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white z-10">
              <div className="max-w-4xl">
                <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded mb-3 uppercase tracking-wider">
                  DESTACADO
                </span>
                <h2 className="text-lg md:text-xl lg:text-2xl xl:text-4xl font-bold mb-3 leading-tight drop-shadow-lg">
                  <Link
                    href={`/${buildCategoryNodePath(post.categories.nodes)}/${post.slug}`}
                    className="hover:text-orange-400 transition-colors"
                  >
                    <div dangerouslySetInnerHTML={{ __html: post.title }}></div>
                  </Link>
                </h2>
                <div className="hidden md:block text-gray-200 text-sm md:text-base lg:text-md max-w-2xl drop-shadow-md">
                  {/* Usamos excerpt si existe, si no limpiamos content */}
                  <div
                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                  ></div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Estilos globales para personalizar los puntitos y flechas de Swiper al color naranja */}
      <style jsx global>{`
        .swiper-pagination-bullet-active {
          background-color: #f97316 !important; /* Orange-500 */
        }
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
          opacity: 0.5;
          transition: all 0.3s;
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          opacity: 1;
          color: #f97316 !important;
        }
      `}</style>
    </div>
  );
}
