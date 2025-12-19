import EscrutinioWidget from "@/components/ui/Escrutinio";
import Header from "../../../Header";

export async function generateMetadata() {
  return {
    title: "Elecciones Extremadura 2025",
    description: "Resultados en tiempo real de las elecciones",
  };
}

export default async function Elecciones() {
  return (
    <>
      <Header />
      <EscrutinioWidget />
    </>
  );
}
