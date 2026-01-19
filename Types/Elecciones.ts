// src/utils/elecciones.ts

export const PARTIDOS_CONFIG: any = {
  'PSOE': { color: '#E30613', ideologia: 2 },
  'PP': { color: '#0056A7', ideologia: 6 },
  'VOX': { color: '#63BE21', ideologia: 7 },
  'PODEMOS': { color: '#951B81', ideologia: 1 },
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

export const getColor = (siglas: string) => {
  const s = siglas.toUpperCase().trim();
  // Búsqueda aproximada (contains)
  const key = Object.keys(PARTIDOS_CONFIG).find(k => s.includes(k));
  return key ? PARTIDOS_CONFIG[key].color : '#CCCCCC';
};

export const getIdeologia = (siglas: string) => {
  const s = siglas.toUpperCase().trim();
  const key = Object.keys(PARTIDOS_CONFIG).find(k => s.includes(k));
  return key ? PARTIDOS_CONFIG[key].ideologia : 3.5;
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