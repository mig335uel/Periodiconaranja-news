import EscrutinioWidget from "@/components/ui/Escrutinio";
import Header from "../../../Header";
import Avances from "@/components/Elecciones/Avances";
import EscrutinioTotal from "@/components/Elecciones/EscrutinioTotal";
import { User } from "@/Types/Account";
import {createClient} from "@/lib/supabase/server";



export async function generateMetadata() {
  return {
    title: "Elecciones Andalucía 2026",
    description: "Resultados en tiempo real de las elecciones",
  };
}

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: dataAuth, error: errorAuth } = await supabase.auth.getUser();


  const { data, error } = await supabase.from('users').select('*').eq('id', dataAuth.user?.id).single();
  return data;
}



export default async function Elecciones() {

  const fechaActual = new Date(Date.now());
  console.log(fechaActual);
  const fechadeApertura = new Date("2026-05-17T20:00:00");
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
          <p className="text-gray-600">Esta pagina será habilitada el 17 de Mayo a las 08:00</p>
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
