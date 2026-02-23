"use client";

export default function AdBanner() {
  return (
    <div className="flex justify-center w-full my-8">
      <iframe
        src="/anuncio.html"
        width="300"
        height="250"
        style={{ border: 'none', overflow: 'hidden' }}
        title="Espacio Publicitario"
      />
    </div>
  );
}


export function AdBanner2() {
  return (
    <div className="flex justify-center w-full my-8">
      <iframe
        src="/anuncio_2.html"
        width="728"
        height="90"
        style={{ border: 'none', overflow: 'hidden' }}
        title="Espacio Publicitario"
      />
    </div>
  );
}