"use client";
import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    jwplayer: any;
  }
}

interface JWPlayerProps {
  videoId: string;
  file: string;
  image?: string;
  libraryUrl: string; // Ahora es obligatorio o tiene fallback
  licenseKey: string;
}

export default function JWPlayer({ videoId, file, image, libraryUrl, licenseKey }: JWPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false); // Para evitar reinicializaciones

  const initPlayer = () => {
    if (window.jwplayer && playerRef.current) {
      // 1. Configurar Key
      window.jwplayer.key = licenseKey;

      // 2. Instanciar Player
      const playerInstance = window.jwplayer(videoId);
      
      // 3. Setup
      playerInstance.setup({
        file: file,
        image: image || "",
        width: "100%",
        aspectratio: "16:9",
        controls: true,
        type: file.includes('.m3u8') ? "hls" : undefined, // Autodetectar HLS
        autostart: false,
      });
    }
  };

  useEffect(() => {
    // Si la librería ya existía (ej: navegación entre páginas), iniciamos directo
    if (window.jwplayer) {
      initPlayer();
    }
    
    return () => {
      // Cleanup al desmontar
      if (window.jwplayer) {
        try {
           const player = window.jwplayer(videoId);
           if (player && typeof player.remove === 'function') player.remove();
        } catch(e) {}
      }
    };
  }, [file, videoId]); // Dependencias clave

  return (
    <div className="w-full relative my-8 bg-black rounded-lg overflow-hidden shadow-lg min-h-[300px]">
      {/* Cargamos el script SOLO si no está ya en window */}
      <Script 
        src={libraryUrl} 
        strategy="afterInteractive"
        onLoad={() => {
            scriptLoadedRef.current = true;
            initPlayer();
        }}
      />
      <div id={videoId} ref={playerRef} className="w-full h-full"></div>
    </div>
  );
}