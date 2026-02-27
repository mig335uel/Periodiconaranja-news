import EscrutinioWidget from "@/components/ui/Escrutinio";
import Header from "../../../Header";
import Avances from "@/components/Elecciones/Avances";
import EscrutinioTotal from "@/components/ui/EscrutinioTotal";

export async function generateMetadata() {
  return {
    title: "Elecciones Castilla y León 2026",
    description: "Resultados en tiempo real de las elecciones",
  };
}

export default async function Elecciones() {

  const date = new Date().getHours();

  return (
    <>
      <Header />
      <Avances />
      <EscrutinioTotal />
    </>
  );
}
