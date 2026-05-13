import EscrutinioWidget from "@/components/ui/Escrutinio";
import Header from "../../../Header";
import Avances from "@/components/Elecciones/Avances";
import EscrutinioTotal from "@/components/Elecciones/EscrutinioTotal";
import { User } from "@/Types/Account";
import {createClient} from "@/lib/supabase/server";



import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elecciones Andalucía 2026 | Resultados en Directo",
  description: "Sigue en tiempo real el escrutinio, avances de participación y resultados de las Elecciones Autonómicas de Andalucía 2026.",
  alternates: {
    canonical: "/elecciones/andalucia/2026",
  },
  openGraph: {
    title: "Resultados Elecciones Andalucía 2026 en Directo",
    description: "Sigue en tiempo real el escrutinio, avances de participación y resultados de las Elecciones Autonómicas de Andalucía 2026. Gráficos interactivos y datos por provincias.",
    url: "/elecciones/andalucia/2026",
    siteName: "Periodico Naranja",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/Imagen_elecciones_andaluzas.jpeg",
        width: 1200,
        height: 630,
        alt: "Cobertura en directo de las Elecciones en Andalucía 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resultados Elecciones Andalucía 2026 en Directo",
    description: "Sigue en tiempo real el escrutinio, avances de participación y resultados de las Elecciones Autonómicas de Andalucía 2026.",
    images: ["/Imagen_elecciones_andaluzas.jpeg"],
    site: "@periodiconrja",
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

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: dataAuth, error: errorAuth } = await supabase.auth.getUser();


  const { data, error } = await supabase.from('users').select('*').eq('id', dataAuth.user?.id).single();
  return data;
}



export default async function Elecciones() {

  const fechaActual = new Date(Date.now());
  console.log(fechaActual);
  const fechadeApertura = new Date("2026-05-17T09:00:00");
  const user = await getCurrentUser();

  if ((!user || user.role === 'viewer') && fechaActual < fechadeApertura) {
    return (
      <>
        <Header />
        <div className="flex flex-col justify-center items-center h-screen">
          <h2 className="text-2xl font-bold text-gray-800">
            Elecciones Andalucía 2026
          </h2>
          <br />
          <p className="text-gray-600">Esta pagina será habilitada el 17 de Mayo a las 09:00</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Avances />
      <EscrutinioTotal />
    </>
  );
}
