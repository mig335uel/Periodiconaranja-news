import EscrutinioWidget from "@/components/ui/Escrutinio";
import Header from "../../../Header";
import Avances from "@/components/Elecciones/Avances";

export async function generateMetadata() {
  return {
    title: "Elecciones Aragón 2026",
    description: "Resultados en tiempo real de las elecciones",
  };
}

export default async function Elecciones() {

  const date = new Date().getHours();

  const timeOpen = new Date().getHours() >= 20;
  return (
    <>
      <Header />
      <EscrutinioWidget />
      <Avances />
    </>
  );
}
