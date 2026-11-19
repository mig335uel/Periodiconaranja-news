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
  // Generales 29N
  'PSIB-PSOE': { color: '#D90202', ideologia: 3.0 },
  'PSC': { color: '#E30613', ideologia: 3.0 },
  'PSDEG-PSOE': { color: '#D90202', ideologia: 3.0 },
  'PSN-PSOE': { color: '#D90202', ideologia: 3.0 },
  'PSE-EE (PSOE)': { color: '#D90202', ideologia: 3.0 },
  'FO': { color: '#990000', ideologia: 0.8 },
  'FRENTE OBRERO': { color: '#990000', ideologia: 0.8 },
  'ADELANTE ANDALUCÍA': { color: '#189D52', ideologia: 1.5 },
  'PODEMOS': { color: '#602E68', ideologia: 1.0 },
  'FA': { color: '#E51C55', ideologia: 1.8 },
  'COMUNS-FRONT AMPLI': { color: '#A91E5C', ideologia: 1.8 },
  'CHA-IU-MS-FRENTE AMPLIO': { color: '#D32F2F', ideologia: 1.8 },
  'FRENTE AMPLIO-FRONTE AMPLA': { color: '#E51C55', ideologia: 1.8 },
  'FRENTE AMPLIO - FRONTE AMPLA': { color: '#E51C55', ideologia: 1.8 },
  'FRENTE AMPLIO-FRONTE ZABALA': { color: '#E51C55', ideologia: 1.8 },
  'ARAMÉS-EU-MS': { color: '#E51C55', ideologia: 1.8 },
  'JXCAT': { color: '#00C3B2', ideologia: 6.5 },
  'JUNTS': { color: '#00C3B2', ideologia: 6.5 },
  'ERC': { color: '#FFB232', ideologia: 2.2 },
  'EH BILDU': { color: '#00AC8E', ideologia: 1.2 },
  'EH BILDU-ERC': { color: '#00AC8E', ideologia: 1.5 },
  'EAJ-PNV': { color: '#008000', ideologia: 6.0 },
  'PNV': { color: '#008000', ideologia: 6.0 },
  'BNG': { color: '#76B3E1', ideologia: 1.8 },
  'B.N.G.': { color: '#76B3E1', ideologia: 1.8 },
  'CCA-1ºCAN': { color: '#FFD700', ideologia: 6.2 },
  '1.ºCAN-CCA': { color: '#FFD700', ideologia: 6.2 },
  'UPN-PP': { color: '#00599C', ideologia: 7.8 },
  'UPN': { color: '#00599C', ideologia: 7.8 },
  'U.P.N.': { color: '#00599C', ideologia: 7.8 },
  'COMPROMIS-EUPV-PODEM-ERPV': { color: '#FF6600', ideologia: 2.0 },
  'TERUEL EXISTE': { color: '#009768', ideologia: 5.0 },
  'NC-BC, PODEMOS, IU, SUMAR': { color: '#6BB130', ideologia: 2.2 },
  'JXCAT - JUNTS': { color: '#00C3B2', ideologia: 6.5 },
  'CCA': { color: '#FFD700', ideologia: 6.2 },
  // Coaliciones Senado 2026 (Senado de Progreso / Insulares)
  'SENADO DE PROGRESO': { color: '#D90202', ideologia: 2.5 },
  'SDP (PSOE, IU, MS, MM, COMPROMIS, CHA, BATZARRE)': { color: '#D90202', ideologia: 2.5 },
  'SDP (PSOE-IU-MS)': { color: '#D90202', ideologia: 2.5 },
  'SDP (PSOE-EZAN IU-MS)': { color: '#D90202', ideologia: 2.5 },
  'SDP (PSOE-MS)': { color: '#D90202', ideologia: 2.5 },
  'SDP (PSOE-CHA-IU-MS)': { color: '#D90202', ideologia: 2.5 },
  'SDP (PSOE-IUN NEB-MS-BATZARRE)': { color: '#D90202', ideologia: 2.5 },
  'SDP (PSOE-COMPROMIS-EUPV)': { color: '#D90202', ideologia: 2.5 },
  'SDP (PSOE-MM-IU-MS)': { color: '#D90202', ideologia: 2.5 },
  'PSOE-MS': { color: '#D90202', ideologia: 2.5 },
  'PSIB-PSOE-MÉS PER MALLORCA-SUMAR-EUIB': { color: '#D90202', ideologia: 2.5 },
  'A.H.I.': { color: '#008F4C', ideologia: 5.5 },
  'ASG': { color: '#C60C30', ideologia: 3.5 },
  'SA UNIÓ': { color: '#0056A7', ideologia: 7.5 },
  // Históricos 2023 (Senado y Congreso)
  'EH BILDU-INDEPENDENTZIA EZKERRETIK': { color: '#00AC8E', ideologia: 1.2 },
  'IZQUIERDAS POR LA INDEPENDENCIA': { color: '#00AC8E', ideologia: 1.5 },
  'ERC-ESQUERRES PER LA INDEPENDÈNCIA': { color: '#FFB232', ideologia: 2.2 },
  'PSOE-SUMAR-EUIB-ARA EIVISSA': { color: '#D90202', ideologia: 2.5 },
  'SUMAR - ECP': { color: '#E51C55', ideologia: 1.8 },
  'SUMAR - COMPROMÍS': { color: '#E51C55', ideologia: 1.8 },
  'SUMAR ARAGÓN': { color: '#E51C55', ideologia: 1.8 },
  'MÉS PER MALLORCA-MÉS PER MENORCA-SUMAR': { color: '#E51C55', ideologia: 1.8 },
};

export interface PartidoMeta {
  color: string;
  ideologia: number;
}

/**
 * Descarga todo el catálogo de partidos desde Supabase en una sola petición
 * para evitar cientos de consultas individuales al procesar las 52 provincias.
 */
export const getPartidosConfigMap = async (): Promise<Map<string, PartidoMeta>> => {
  const map = new Map<string, PartidoMeta>();

  for (const [key, val] of Object.entries(PARTIDOS_CONFIG) as [string, PartidoMeta][]) {
    map.set(key.toUpperCase().trim(), {
      color: val.color,
      ideologia: Number(val.ideologia) || 5.0,
    });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('partidos_politicos')
      .select('siglas, color, ideologia');

    if (!error && data) {
      for (const row of data) {
        if (row.siglas) {
          map.set(String(row.siglas).toUpperCase().trim(), {
            color: row.color || '#CCCCCC',
            ideologia: Number(row.ideologia) || 5.0,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error al cargar mapa de partidos desde Supabase:', err);
  }

  return map;
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


export interface EleccionesData {
  name: string;
  has_chart: string;
  mayoria: number;
  escrutado: number;
  data_2025: PartidoData[];
  data_2023: PartidoData[];
}


export interface DatosAvance {
  hora: string;
  porcentaje: string;
  mesasComunicadas: number;
  censoComunicado: number;
}