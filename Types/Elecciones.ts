// src/utils/elecciones.ts
import { createClient } from "@/lib/supabase/client";

export const PARTIDOS_CONFIG: any = {
  'PSOE': { color: '#E30613', ideologia: 2 },
  'PP': { color: '#0056A7', ideologia: 6 },
  'VOX': { color: '#63BE21', ideologia: 7 },
  'PODEMOS-IU-AV': { color: '#951B81', ideologia: 1 },
  'SUMAR': { color: '#E4007C', ideologia: 1 },
  'JUNTOS-LEVANTA': { color: '#448844', ideologia: 4 },
  'EXTREMADURA UNIDA': { color: '#009A47', ideologia: 4 },
  'CS': { color: '#EB6109', ideologia: 5 },
  'PACMA': { color: '#9ACD32', ideologia: 3 },
  'UED-SYT': { color: '#008080', ideologia: 2.5 },
  'NEX': { color: '#555555', ideologia: 4 },
  'MUNDO+JUSTO': { color: '#F5821F', ideologia: 1.5 },
  // Aragón
  'SALF': { color: '#8B4513', ideologia: 7 }, // Derecha (Se Acabó La Fiesta) - Color marrón/oscuro
  'CHA': { color: '#D21F1F', ideologia: 2.5 }, // Chunta Aragonesista (Izquierda/Aragonesismo)
  'EXISTE': { color: '#008000', ideologia: 4 }, // Aragón Existe (Centro/Regionalismo)
  'PAR': { color: '#FFD700', ideologia: 5 }, // Partido Aragonés (Centro-Derecha)
  'ESCAÑOS EN BLANCO': { color: '#000000', ideologia: 4 },
  'COALICIÓN ARAGONESA': { color: '#FFA500', ideologia: 5 }, // Asumiendo regionalismo
  'PCTE': { color: '#FF0000', ideologia: 0.5 }, // Comunista
  'ETXSBC': { color: '#888888', ideologia: 4 }, // Desconocido/Otros
  'IU': { color: '#D50000', ideologia: 1 },
  'IU- MOVIMIENTO SUMAR': { color: '#D50000', ideologia: 1 },

};


interface PartidoColor {
  siglas: { color: string, ideologia: number }
}



export const getColor = async (siglas: string): Promise<string> => {
  const s = siglas;

  // 1. FAST FALLBACK: Si existe en el array estático local, lo devolvemos inmediatamente


  try {
    const supabase = await createClient();

    // 2. Extraemos el color de Supabase
    const { data: partido, error } = await supabase
      .from('partidos_politicos')
      .select('color')
      .ilike('siglas', `%${s}%`)
      .maybeSingle();
    // 3. Comprobamos si hubo un error en la base de datos o si el partido no existe (data es null)
    if (error || !partido) {
      console.warn(`Partido no encontrado en BD ni en Config Local (${s}). Usando gris por defecto.`);
      return '#CCCCCC';
    }

    return partido.color;

  } catch (err) {
    console.error('Error de red al obtener el color del partido:', err);
    return '#CCCCCC';
  }
};

export const getIdeologia = async (siglas: string): Promise<number> => {
  const s = siglas.toUpperCase().trim();

  // 1. FAST FALLBACK: Configuración estática local
  if (PARTIDOS_CONFIG[s] && typeof PARTIDOS_CONFIG[s].ideologia !== 'undefined') {
    return PARTIDOS_CONFIG[s].ideologia;
  }

  try {
    const supabase = await createClient();

    const { data: partido, error } = await supabase
      .from('partidos_politicos')
      .select('ideologia')
      .ilike('siglas', `%${s}%`)
      .maybeSingle();

    if (error || !partido) {
      return 3.5; // Ideologia neutra por defecto si no lo encuentra por ningún lado
    }

    return Number(partido.ideologia);

  } catch (err) {
    console.error('Error de red al obtener la ideología del partido:', err);
    return 3.5;
  }
};

// Interfaz de datos
export interface PartidoData {
  siglas: string;
  escanos: number;
  votos: number;
  porc: string;
  color: string;
  ideologia: number;
}

export interface RegionData {
  nombre: string;
  escrutado: string;
  mayoria: number;
  total_dip: number;
  partidos: PartidoData[];
}



export interface DatosAvance {
  hora: string;
  porcentaje: string;
  mesasComunicadas: number;
  censoComunicado: number;
}