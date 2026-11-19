import { PartidoData, PartidoMeta, RegionData } from '@/Types/Elecciones';
import { Camara, ParsedGeneralesDataset, TerritorialEntry } from './types';

/**
 * Devuelve el color del partido ganador en una región (con desempate usando los datos globales).
 */
export function getColorGanador(
  region: RegionData | null,
  global: RegionData | null
): string {
  if (!region || !region.partidos || region.partidos.length === 0) return '#d1d5db';

  const ganadores = [...region.partidos].sort((a, b) => {
    if (b.escanos !== a.escanos) return b.escanos - a.escanos;

    if (global?.partidos) {
      const aGlobal = global.partidos.find((p) => p.siglas === a.siglas);
      const bGlobal = global.partidos.find((p) => p.siglas === b.siglas);
      const aEscGlobal = aGlobal ? aGlobal.escanos : 0;
      const bEscGlobal = bGlobal ? bGlobal.escanos : 0;
      if (bEscGlobal !== aEscGlobal) return bEscGlobal - aEscGlobal;

      const aVotGlobal = aGlobal ? aGlobal.votos : 0;
      const bVotGlobal = bGlobal ? bGlobal.votos : 0;
      if (bVotGlobal !== aVotGlobal) return bVotGlobal - aVotGlobal;
    }

    return b.votos - a.votos;
  });

  if (ganadores[0].escanos > 0 || ganadores[0].votos > 0) {
    return ganadores[0].color;
  }
  return '#d1d5db';
}

/**
 * Resuelve color e ideología de unas siglas buscando primero coincidencia exacta
 * en el mapa (Supabase + config local) y aplicando fallback por prefijo para coaliciones.
 */
export function resolvePartidoMeta(
  siglas: string,
  configMap: Map<string, PartidoMeta>
): PartidoMeta {
  const key = siglas.toUpperCase().trim();
  const exact = configMap.get(key);
  if (exact) return exact;

  if (
    key.startsWith('SDP (') ||
    key.startsWith('SENADO DE PROGRESO') ||
    key.startsWith('PSOE-') ||
    key.startsWith('PSIB-PSOE') ||
    key.startsWith('PSDEG-PSOE') ||
    key.startsWith('PSN-PSOE') ||
    key.startsWith('PSE-EE')
  ) {
    return { color: '#D90202', ideologia: 2.5 };
  }
  if (key.startsWith('FRENTE AMPLIO') || key.startsWith('SUMAR')) {
    return { color: '#E51C55', ideologia: 1.8 };
  }
  if (key.startsWith('EH BILDU') || key.includes('IZQUIERDAS POR LA INDEPENDENCIA')) {
    return { color: '#00AC8E', ideologia: 1.2 };
  }
  if (key.startsWith('ERC')) {
    return { color: '#FFB232', ideologia: 2.2 };
  }
  if (key.startsWith('JXCAT') || key.startsWith('JUNTS')) {
    return { color: '#00C3B2', ideologia: 6.5 };
  }
  if (key.startsWith('UPN') || key === 'U.P.N.') {
    return { color: '#00599C', ideologia: 7.8 };
  }
  if (key.startsWith('PP-') || key.endsWith('-PP')) {
    return { color: '#0056A7', ideologia: 8.0 };
  }

  return { color: '#CCCCCC', ideologia: 5.0 };
}

/**
 * Parsea un CSV oficial de escrutinio (Congreso o Senado, actual o histórico 07-23)
 * separando España (TO), Comunidades (CM) y Provincias / Circunscripciones (PR / CI).
 */
export function parseGeneralesCsv(
  rows: string[][],
  configMap: Map<string, PartidoMeta>,
  camara: Camara,
  isHistorico: boolean = false
): ParsedGeneralesDataset {
  let espana: RegionData | null = null;
  const comunidades: TerritorialEntry[] = [];
  const provincias: TerritorialEntry[] = [];

  const isSenado = camara === 'senado';
  const inicio = isSenado ? 19 : 22;
  const stride = isSenado ? (isHistorico ? 3 : 7) : 5;

  for (const col of rows) {
    if (!col || col.length < inicio + 2) continue;

    const tipo = col[1]?.trim();
    if (tipo !== 'TO' && tipo !== 'CM' && tipo !== 'PR' && tipo !== 'CI') continue;

    const codComunidad = col[2]?.trim() || '';
    const codProvincia = col[3]?.trim() || '';
    const codIsla = col[4]?.trim() || '9';
    const nombre = (col[5] || col[4] || '').trim();
    const totalDip = parseInt(col[18], 10) || (isSenado && tipo === 'TO' ? 208 : 0);
    const totalVotantes = parseInt(col[10], 10) || 0;
    const escrutado =
      ((parseFloat(col[9] || '0') || 0) / 100).toFixed(2).replace('.', ',') + '%';

    const partidosMap = new Map<string, PartidoData & { rawPorc: number }>();

    for (let i = 0; i < 80; i++) {
      const idx = inicio + i * stride;
      if (idx + 1 >= col.length) break;

      const codCand = col[idx]?.trim() || '0000';
      const siglas = col[idx + 1]?.trim() || '';
      if (!siglas || codCand === '0000' || /^0+$/.test(siglas)) continue;

      let votos = 0;
      let rawPorc = 0;
      let escanos = 0;

      if (isSenado) {
        if (isHistorico) {
          // Senado 2023 (Apartado 3.4): +0 Código, +1 Siglas, +2 Senadores electos
          escanos = parseInt(col[idx + 2] || '0', 10) || 0;
        } else {
          // Senado 2026 (Apartado 3.3): +0 Código, +1 Siglas, +2 Orden, +3 Nombre, +4 Votos, +5 Porc, +6 Electos
          votos = parseInt(col[idx + 4] || '0', 10) || 0;
          rawPorc = parseFloat((col[idx + 5] || '0').replace(',', '.')) || 0;
          escanos = parseInt(col[idx + 6] || '0', 10) || 0;
        }
      } else {
        // Congreso: +0 Código, +1 Siglas, +2 Votos, +3 Porc, +4 Escaños
        votos = parseInt(col[idx + 2] || '0', 10) || 0;
        rawPorc = parseFloat((col[idx + 3] || '0').replace(',', '.')) || 0;
        escanos = parseInt(col[idx + 4] || '0', 10) || 0;
      }

      if (votos > 0 || escanos > 0 || (!isHistorico && totalVotantes === 0)) {
        const existing = partidosMap.get(siglas);
        if (existing) {
          existing.votos += votos;
          existing.escanos += escanos;
          if (rawPorc > existing.rawPorc) {
            existing.rawPorc = rawPorc;
            existing.porc = (rawPorc / 100).toFixed(2).replace('.', ',') + '%';
          }
        } else {
          const meta = resolvePartidoMeta(siglas, configMap);
          partidosMap.set(siglas, {
            siglas,
            escanos,
            votos,
            rawPorc,
            porc: (rawPorc / 100).toFixed(2).replace('.', ',') + '%',
            color: meta.color,
            ideologia: meta.ideologia,
          });
        }
      }
    }

    const partidos: PartidoData[] = Array.from(partidosMap.values()).map(
      ({ rawPorc: _rawPorc, ...rest }) => rest
    );

    partidos.sort((a, b) => {
      if (b.escanos !== a.escanos) return b.escanos - a.escanos;
      return b.votos - a.votos;
    });

    const regionData: RegionData = {
      nombre,
      escrutado,
      mayoria: Math.floor(totalDip / 2) + 1,
      total_dip: totalDip,
      partidos,
    };

    if (tipo === 'TO') {
      espana = regionData;
    } else if (tipo === 'CM') {
      comunidades.push({
        key: `CM-${codComunidad}`,
        codigo: codComunidad,
        region: regionData,
      });
    } else if (tipo === 'PR' || tipo === 'CI') {
      provincias.push({
        key: tipo === 'CI' ? `CI-${codProvincia}-${codIsla}` : `PR-${codProvincia}`,
        codigo: codProvincia,
        region: regionData,
      });
    }
  }

  comunidades.sort((a, b) => a.region.nombre.localeCompare(b.region.nombre, 'es'));
  provincias.sort((a, b) => a.region.nombre.localeCompare(b.region.nombre, 'es'));

  return { espana, comunidades, provincias };
}
