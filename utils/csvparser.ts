// src/utils/csvParsers.ts

export interface DatosAvance {
  hora: string;
  porcentaje: string;
  mesasComunicadas: number;
  censoComunicado: number;
}

export function parseCsvAvances(
  csvText: string,
  tipoRegistro: string = 'CM',
  horas: string[] = ['11:30', '14:00', '18:00']
) {
  const rows = csvText.split(/\r\n|\r|\n/);
  let dataRow: string[] | null = null;

  // Buscamos la fila de totales ('CM' para autonómicas, 'TO' para generales)
  for (const row of rows) {
    const cols = row.split(';');
    if (cols[1] && cols[1].trim() === tipoRegistro) {
      dataRow = cols;
      break;
    }
  }

  if (!dataRow) return null;

  const avances: DatosAvance[] = [];

  // Indices basados en totales_avances:
  // 0: Fecha, 1: Tipo (CM/TO), ..., 6: MesasTot, 7: MesasConst, 8: MesasSusp,
  // 9: CensoTot, 10: CensoConst, 11: CensoSusp
  // 12+: Bloques de 3 columnas (Mesas, Censo, Participación * 100)
  for (let i = 0; i < horas.length; i++) {
    const baseIdx = 12 + i * 3;

    const rawMesas = dataRow[baseIdx];
    const rawCenso = dataRow[baseIdx + 1];
    const rawPorc = dataRow[baseIdx + 2];

    if (rawPorc && parseInt(rawPorc, 10) > 0) {
      const porcFloat = parseFloat(rawPorc) / 100;

      avances.push({
        hora: horas[i],
        porcentaje: porcFloat.toFixed(2).replace('.', ','),
        mesasComunicadas: parseInt(rawMesas || '0', 10),
        censoComunicado: parseInt(rawCenso || '0', 10),
      });
    }
  }

  return avances;
}