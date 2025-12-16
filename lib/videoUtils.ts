// lib/videoUtils.ts

export interface ExtractedVideoData {
  file: string | null;
  cleanContent: string;
}

export function extractAndCleanJWPlayer(htmlContent: string): ExtractedVideoData {
  // 1. Buscamos la URL del archivo .m3u8 o mp4 usando Regex
  // Busca: file: "https://..."
  const fileMatch = htmlContent.match(/file:\s*"([^"]+)"/);
  const file = fileMatch ? fileMatch[1] : null;

  // 2. Limpiamos el HTML para quitar el script y el div vacío que deja WordPress
  // Eliminamos el bloque <script>...</script> entero
  let cleanContent = htmlContent.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  
  // Eliminamos el div con id="player_..."
  cleanContent = cleanContent.replace(/<div id="player_[^"]+"><\/div>/gi, "");

  return {
    file,
    cleanContent
  };
}