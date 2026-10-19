"use client";

import ConsentGate from "@/components/cookies/ConsentGate";

// Los anuncios solo se cargan si el usuario ha aceptado las cookies de publicidad.
export default function AdBanner() {
  return (
    <ConsentGate category="publicidad" fallback="hide">
      <div className="flex justify-center w-full my-8">
        <iframe
          src="/anuncio.html"
          width="300"
          height="250"
          sandbox="allow-scripts allow-same-origin allow-popups"
          style={{ border: 'none', overflow: 'hidden' }}
          title="Espacio Publicitario"
        />
      </div>
    </ConsentGate>
  );
}


export function AdBanner2() {
  return (
    <ConsentGate category="publicidad" fallback="hide">
      <div className="flex justify-center w-full my-8">
        <iframe
          src="/anuncio_2.html"
          width="728"
          height="90"
          sandbox="allow-scripts allow-same-origin allow-popups"
          style={{ border: 'none', overflow: 'hidden' }}
          title="Espacio Publicitario"
        />
      </div>
    </ConsentGate>
  );
}