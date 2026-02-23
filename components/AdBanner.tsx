"use client";

import { useEffect, useRef } from "react";

export default function AdBanner() {
  const banner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verificamos que el contenedor exista y esté vacío para no duplicar el script
    if (banner.current && !banner.current.firstChild) {
      
      // Variable global que espera tu red de anuncios
      (window as any).atOptions = {
        key: '9239aea4dfe3c3ca5d799afdae3f74f6',
        format: 'iframe',
        height: 250,
        width: 300,
        params: {}
      };

      // Creamos el script dinámicamente
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://www.highperformanceformat.com/9239aea4dfe3c3ca5d799afdae3f74f6/invoke.js";
      script.async = true;

      // Lo inyectamos en nuestro div
      banner.current.appendChild(script);
    }
  }, []);

  return (
    <div 
      ref={banner} 
      // Este diseño centra el anuncio y le da un alto mínimo para evitar saltos en la pantalla
      className="flex justify-center w-full my-8 min-h-[250px] overflow-hidden"
    ></div>
  );
}