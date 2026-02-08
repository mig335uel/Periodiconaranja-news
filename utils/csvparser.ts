// src/utils/csvParsers.ts

export interface DatosAvance {
  hora: string;
  porcentaje: string;
  mesasComunicadas: number;
  censoComunicado: number;
}

export function parseCsvAvances(csvText: string) {
  const rows = csvText.split(/\r\n|\r|\n/);
  let dataRow: string[] | null = null;

  // Buscamos la fila "CM" (Comunidad) que es la que tiene los totales globales
  for (const row of rows) {
    const cols = row.split(';');
    // En tu CSV: Columna 1 es 'CM' -> 2602081422;CM;2;...
    if (cols[1] && cols[1].trim() === 'CM') {
      dataRow = cols;
      break;
    }
  }

  if (!dataRow) return null;

  const avances: DatosAvance[] = [];
  const horas = ['12:00', '14:00', '18:00']; // Etiquetas típicas, ajústalas si son otras

  // Tu CSV tiene 3 bloques de avances (cols 12-14, 15-17, 18-20)
  // Indices basados en tu archivo totales_avances_502_54.csv:
  // 0: Fecha, 1: CM, ..., 6: MesasTot, 7: MesasConst, 8: MesasSusp, 
  // 9: CensoTot, 10: CensoConst, 11: CensoSusp
  // 12: INICIO AVANCE 1

  for (let i = 0; i < 3; i++) {
    // El primer bloque empieza en 12. Los bloques son de 3 columnas.
    const baseIdx = 12 + (i * 3);

    const rawMesas = dataRow[baseIdx];      // Ej: 2213
    const rawCenso = dataRow[baseIdx + 1];  // Ej: 991892
    const rawPorc = dataRow[baseIdx + 2];   // Ej: 1085 (es 10,85%)

    // Solo añadimos si hay porcentaje (mayor que 0)
    if (rawPorc && parseInt(rawPorc) > 0) {
      const porcFloat = parseFloat(rawPorc) / 100;
      
      avances.push({
        hora: horas[i],
        porcentaje: porcFloat.toFixed(2).replace('.', ','), // "10,85"
        mesasComunicadas: parseInt(rawMesas || '0'),
        censoComunicado: parseInt(rawCenso || '0'),
      });
    }
  }

  return avances;
}