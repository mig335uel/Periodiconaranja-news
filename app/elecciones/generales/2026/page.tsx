import Header from '../../../Header';
import AvancesGenerales from '@/components/Elecciones/AvancesGenerales';
import EscrutinioGenerales from '@/components/Elecciones/EscrutinioGenerales';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Elecciones Generales 2026 | Resultados en Directo',
  description:
    'Sigue en tiempo real el escrutinio, avances de participación y resultados del Congreso y Senado en las Elecciones Generales 2026 (29N).',
  alternates: {
    canonical: '/elecciones/generales/2026',
  },
  openGraph: {
    title: 'Resultados Elecciones Generales 2026 en Directo',
    description:
      'Escrutinio en tiempo real, hemiciclo del Congreso y Senado, pactómetro y resultados por comunidades y provincias.',
    url: '/elecciones/generales/2026',
    siteName: 'Periodico Naranja',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resultados Elecciones Generales 2026 en Directo',
    description:
      'Sigue en tiempo real el escrutinio, avances de participación y resultados de las Elecciones Generales 2026.',
    site: '@periodiconrja',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function EleccionesGenerales2026Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 py-4">
        <AvancesGenerales />
        <EscrutinioGenerales />
      </main>
    </>
  );
}
