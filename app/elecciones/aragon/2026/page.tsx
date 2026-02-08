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

  if(Date.now() < new Date("2026-02-08T20:00:00").getTime()) {
    return (
      <>
        <Header />
        <h1 className="text-3xl text-center m-10 font-black">El escrutinio todavia no ha empezado</h1>
        <Avances />
      </>
    );
  }
  return (
    <>
      <Header />
      <EscrutinioWidget />
      <Avances />
    </>
  );
}
