'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  getPartidosConfigMap,
  PartidoData,
  PartidoMeta,
  RegionData,
} from '@/Types/Elecciones';
import { useAuth } from '@/hooks/useAuth';
import MapaEspana from '../ui/MapaEspana';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

type Camara = 'congreso' | 'senado';
type AmbitoTerritorial = 'comunidades' | 'provincias';

interface TerritorialEntry {
  key: string;
  codigo: string;
  region: RegionData;
}

interface ParsedGeneralesDataset {
  espana: RegionData | null;
  comunidades: TerritorialEntry[];
  provincias: TerritorialEntry[];
}

const EMPTY_DATASET: ParsedGeneralesDataset = {
  espana: null,
  comunidades: [],
  provincias: [],
};

function getColorGanador(region: RegionData | null, global: RegionData | null): string {
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

function resolvePartidoMeta(
  siglas: string,
  configMap: Map<string, PartidoMeta>
): PartidoMeta {
  const key = siglas.toUpperCase().trim();
  const exact = configMap.get(key);
  if (exact) return exact;

  // Fallback inteligente para coaliciones territoriales (especialmente Senado)
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

function parseGeneralesCsv(
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

    const partidosMap = new Map<
      string,
      PartidoData & { rawPorc: number }
    >();

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

export default function EscrutinioGenerales() {
  const { user } = useAuth();
  const [camara, setCamara] = useState<Camara>('congreso');
  const [data, setData] = useState<ParsedGeneralesDataset>(EMPTY_DATASET);
  const [oldData, setOldData] = useState<ParsedGeneralesDataset>(EMPTY_DATASET);
  const [selectedKey, setSelectedKey] = useState<string>('TO');
  const [ambitoTab, setAmbitoTab] = useState<AmbitoTerritorial>('provincias');
  const [busqueda, setBusqueda] = useState('');
  const [pactometro, setPactometro] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [envio, setEnvio] = useState('-');
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    region: RegionData | null;
  }>({ visible: false, x: 0, y: 0, region: null });

  const coloresMapa = useMemo(() => {
    const map: Partial<Record<string, string>> = {};
    for (const item of data.provincias) {
      map[item.codigo] = getColorGanador(item.region, data.espana);
    }
    return map;
  }, [data]);

  const handleMapHover = (codProv: string | null, e: React.MouseEvent | null) => {
    if (codProv && e) {
      const found = data.provincias.find((p) => p.codigo === codProv)?.region || null;
      setTooltip({ visible: true, x: e.clientX, y: e.clientY, region: found });
    } else {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleMapSelect = (codProv: string) => {
    const found = data.provincias.find((p) => p.codigo === codProv);
    if (found) {
      setSelectedKey(found.key);
      setPactometro([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fechaActual = new Date();
  const [fechadeApertura] = useState(new Date('2026-11-29T20:00:00'));

  const fetchData = async (activeCamara: Camara) => {
    try {
      setErrorMsg(null);
      const timestamp = Date.now();
      const configMap = await getPartidosConfigMap();

      const resEnvio = await fetch(
        `/api/elecciones/generales?mode=check&camara=${activeCamara}&t=${timestamp}`,
        { cache: 'no-store' }
      );

      let numEnvio = '001';
      if (resEnvio.ok) {
        const text = await resEnvio.text();
        numEnvio = text.replace(/['"]+/g, '').trim() || '001';
        if (numEnvio === '0') numEnvio = '001';
      }
      setEnvio(numEnvio);

      const [resCsv, resOldData] = await Promise.all([
        fetch(
          `/api/elecciones/generales?mode=download&camara=${activeCamara}&id=${numEnvio}&t=${timestamp}`,
          { cache: 'no-store' }
        ),
        fetch(
          `/api/elecciones/generales?mode=oldData&camara=${activeCamara}&t=${timestamp}`,
          { cache: 'no-store' }
        ),
      ]);

      if (!resCsv.ok) {
        throw new Error('Esperando inicio del escrutinio...');
      }

      const csvText = await resCsv.text();
      Papa.parse(csvText, {
        delimiter: ';',
        complete: (results) => {
          const parsed = parseGeneralesCsv(
            results.data as string[][],
            configMap,
            activeCamara,
            false
          );
          setData(parsed);
        },
      });

      if (resOldData.ok) {
        const csvOldText = await resOldData.text();
        Papa.parse(csvOldText, {
          delimiter: ';',
          complete: (results) => {
            const parsedOld = parseGeneralesCsv(
              results.data as string[][],
              configMap,
              activeCamara,
              true
            );
            setOldData(parsedOld);
          },
        });
      } else {
        setOldData(EMPTY_DATASET);
      }
    } catch (error) {
      console.error('Error en polling generales:', error);
      setErrorMsg(
        error instanceof Error ? error.message : 'No se pudieron cargar los datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setSelectedKey('TO');
    setPactometro([]);
    fetchData(camara);
    const interval = setInterval(() => fetchData(camara), 60000);
    return () => clearInterval(interval);
  }, [camara]);

  const activeRegion: RegionData | null = useMemo(() => {
    if (selectedKey === 'TO') return data.espana;
    return (
      data.comunidades.find((c) => c.key === selectedKey)?.region ||
      data.provincias.find((p) => p.key === selectedKey)?.region ||
      data.espana
    );
  }, [data, selectedKey]);

  const activeOldRegion: RegionData | null = useMemo(() => {
    if (selectedKey === 'TO') return oldData.espana;
    return (
      oldData.comunidades.find((c) => c.key === selectedKey)?.region ||
      oldData.provincias.find((p) => p.key === selectedKey)?.region ||
      null
    );
  }, [oldData, selectedKey]);

  const filteredTerritories = useMemo(() => {
    const list = ambitoTab === 'comunidades' ? data.comunidades : data.provincias;
    const q = busqueda.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => item.region.nombre.toLowerCase().includes(q));
  }, [ambitoTab, busqueda, data]);

  const togglePacto = (siglas: string) => {
    setPactometro((prev) =>
      prev.includes(siglas) ? prev.filter((s) => s !== siglas) : [...prev, siglas]
    );
  };

  if ((!user || user.role === 'viewer') && fechaActual < fechadeApertura) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center bg-white rounded-xl border border-gray-200 shadow-sm my-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Elecciones Generales 2026 (29N)
        </h2>
        <p className="text-gray-600">
          El escrutinio electoral en directo se abrirá el 29 de noviembre a las 20:00.
        </p>
      </div>
    );
  }

  if (loading && !data.espana) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center text-gray-500">
        Cargando Escrutinio de Elecciones Generales...
      </div>
    );
  }

  if (errorMsg && !data.espana) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center bg-orange-50 border border-orange-200 rounded-xl my-4">
        <p className="font-semibold text-orange-800">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 bg-gray-50 rounded-xl shadow-sm my-4">
      {tooltip.visible && tooltip.region && (
        <div
          className="fixed bg-gray-900/90 text-white p-3 rounded-lg shadow-xl z-50 pointer-events-none border border-gray-700 backdrop-blur-sm min-w-[200px]"
          style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}
        >
          <div className="font-bold mb-2 border-b border-gray-600 pb-1">
            {tooltip.region.nombre}
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between w-full mb-2 text-gray-300">
              <span>Escrutado:</span>
              <span>{tooltip.region.escrutado}</span>
            </div>
            {tooltip.region.partidos.slice(0, 3).map((p) => (
              <div key={p.siglas} className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span>{p.siglas}</span>
                </div>
                <div className="flex gap-3 text-right font-mono">
                  <span>{p.escanos} esc</span>
                  <span className="text-gray-400">{p.porc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">
              Elecciones Generales 2026
            </h1>
            <span className="bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded animate-pulse">
              EN DIRECTO
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Envío #{envio} · Comparativa oficial con julio de 2023
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm self-start">
          <button
            type="button"
            onClick={() => setCamara('congreso')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              camara === 'congreso'
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Congreso (350)
          </button>
          <button
            type="button"
            onClick={() => setCamara('senado')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              camara === 'senado'
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Senado (208)
          </button>
        </div>
      </header>

      {selectedKey !== 'TO' && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              setSelectedKey('TO');
              setPactometro([]);
            }}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            ← Volver al total de España
          </button>
        </div>
      )}

      {activeRegion && (
        <RegionCard
          data={activeRegion}
          oldData={activeOldRegion}
          camara={camara}
          title={
            selectedKey === 'TO'
              ? `España · ${camara === 'congreso' ? 'Congreso' : 'Senado'}`
              : `${activeRegion.nombre} · ${camara === 'congreso' ? 'Congreso' : 'Senado'}`
          }
          isMain={true}
        />
      )}

      {/* MAPA DE ESPAÑA POR PROVINCIAS */}
      <section className="mt-8 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">
            Mapa por provincias
          </h3>
          <span className="text-xs text-gray-500">
            Pasa el ratón o pulsa una provincia para ver su escrutinio
          </span>
        </div>
        <div className="flex justify-center w-full">
          <MapaEspana
            colores={coloresMapa}
            onHover={handleMapHover}
            onSelect={handleMapSelect}
          />
        </div>
      </section>

      {/* PACTÓMETRO */}
      {activeRegion && activeRegion.partidos.some((p) => p.escanos > 0) && (
        <PactometroCard
          region={activeRegion}
          camara={camara}
          selectedSiglas={pactometro}
          onToggle={togglePacto}
          onClear={() => setPactometro([])}
        />
      )}

      {/* DESGLOSE TERRITORIAL: CCAA Y PROVINCIAS */}
      <section className="mt-8 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-b pb-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAmbitoTab('provincias')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                ambitoTab === 'provincias'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {camara === 'senado' ? 'Circunscripciones' : 'Provincias'} ({data.provincias.length})
            </button>
            <button
              type="button"
              onClick={() => setAmbitoTab('comunidades')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                ambitoTab === 'comunidades'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Comunidades Autónomas ({data.comunidades.length})
            </button>
          </div>

          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar provincia o comunidad..."
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTerritories.map((item) => {
            const winColor = getColorGanador(item.region, data.espana);
            const isSelected = selectedKey === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setSelectedKey(item.key);
                  setPactometro([]);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`text-left p-3.5 rounded-lg border transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-100 bg-orange-50/30'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: winColor }}
                    />
                    <span className="font-bold text-gray-900 truncate">
                      {item.region.nombre}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-gray-500 shrink-0">
                    {item.region.escrutado}
                  </span>
                </div>

                <div className="space-y-1">
                  {item.region.partidos.slice(0, 3).map((p) => (
                    <div
                      key={p.siglas}
                      className="flex justify-between items-center text-xs text-gray-700"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="truncate font-medium">{p.siglas}</span>
                      </div>
                      <div className="flex gap-2 shrink-0 font-mono">
                        <span className="font-bold">{p.escanos}</span>
                        {p.votos > 0 && (
                          <span className="text-gray-400 w-12 text-right">{p.porc}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const RegionCard = ({
  data,
  oldData,
  camara,
  title,
  isMain = false,
}: {
  data: RegionData;
  oldData?: RegionData | null;
  camara: Camara;
  title: string;
  isMain?: boolean;
}) => {
  const hasVotos = data.partidos.some((p) => p.votos > 0);
  const labelEscanos = camara === 'senado' ? 'Senadores' : 'Escaños';
  const unifiedMap = new Map<string, PartidoData>();

  [...(data.partidos || []), ...(oldData?.partidos || [])].forEach((p) => {
    if (p.escanos > 0 && !unifiedMap.has(p.siglas)) {
      unifiedMap.set(p.siglas, p);
    }
  });

  const unifiedParties = Array.from(unifiedMap.values()).sort(
    (a, b) => a.ideologia - b.ideologia
  );

  const currentSeats = unifiedParties.map((u) => {
    const match = data.partidos.find((p) => p.siglas === u.siglas);
    return match ? match.escanos : 0;
  });

  const oldSeats = unifiedParties.map((u) => {
    const match = oldData?.partidos?.find((p) => p.siglas === u.siglas);
    return match ? match.escanos : 0;
  });

  const unifiedColors = unifiedParties.map((u) => u.color);
  const unifiedLabels = unifiedParties.map((u) => u.siglas);

  const chartData: {
    labels: string[];
    datasets: Array<Record<string, unknown>>;
  } = {
    labels: unifiedLabels,
    datasets: [
      {
        data: currentSeats,
        backgroundColor: unifiedColors,
        borderWidth: 2,
        borderColor: '#ffffff',
        cutout: '55%',
      },
    ],
  };

  if (oldData && oldData.partidos && oldData.partidos.length > 0) {
    chartData.datasets.push({
      data: oldSeats,
      backgroundColor: unifiedColors,
      borderWidth: 2,
      borderColor: '#ffffff',
      cutout: '50%',
      radius: '75%',
      opacity: 0.6,
      datalabels: { display: false },
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    cutout: '50%',
    layout: {
      padding: { bottom: 20 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx: { datasetIndex: number; label: string; raw: unknown }) => {
            const year = ctx.datasetIndex === 0 ? '2026' : '2023';
            return `${year}: ${ctx.label} (${ctx.raw} esc)`;
          },
        },
      },
      datalabels: {
        labels: {
          valor: {
            color: 'white',
            font: { weight: 'bold' as const, size: isMain ? 14 : 12 },
            formatter: (value: number) => (value > 0 ? value : ''),
            align: 'center' as const,
            anchor: 'center' as const,
            offset: -2,
          },
        },
      },
    },
  };

  return (
    <div
      className={`bg-white p-4 sm:p-6 rounded-lg border ${
        isMain ? 'border-orange-200 shadow-md' : 'border-gray-200'
      }`}
    >
      <h2 className={`text-center font-bold mb-3 ${isMain ? 'text-xl' : 'text-lg'}`}>
        {title}
      </h2>

      <div className="flex flex-wrap justify-around gap-2 text-sm text-gray-600 mb-4 font-mono bg-gray-50 p-2.5 rounded">
        <span>
          Escrutado: <strong>{data.escrutado}</strong>
        </span>
        <span>
          {labelEscanos}: <strong>{data.total_dip}</strong>
        </span>
        <span>
          Mayoría absoluta: <strong>{data.mayoria}</strong>
        </span>
      </div>

      <div className={`relative ${isMain ? 'h-72' : 'h-48'}`}>
        {unifiedParties.length > 0 ? (
          <Doughnut data={chartData as never} options={options as never} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Sin {labelEscanos.toLowerCase()} asignados todavía
          </div>
        )}
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-100 text-gray-700">
            <tr>
              <th className="px-2 py-2">Partido</th>
              <th className="px-2 py-2 text-center whitespace-nowrap">
                {labelEscanos} 2026
              </th>
              <th className="px-2 py-2 text-center whitespace-nowrap">Dif</th>
              {hasVotos && (
                <>
                  <th className="px-2 py-2 text-right whitespace-nowrap">Votos</th>
                  <th className="px-2 py-2 text-right whitespace-nowrap">% Voto</th>
                </>
              )}
              <th className="px-2 py-2 text-center whitespace-nowrap hidden sm:table-cell">
                2023
              </th>
            </tr>
          </thead>
          <tbody>
            {data.partidos.map((p) => {
              const oldMatch = oldData?.partidos?.find((o) => o.siglas === p.siglas);
              const oldEsc = oldMatch ? oldMatch.escanos : 0;
              const dif = p.escanos - oldEsc;
              const pctNum = hasVotos
                ? parseFloat(p.porc.replace(',', '.')) || 0
                : data.total_dip > 0
                ? (p.escanos / data.total_dip) * 100
                : 0;

              return (
                <tr key={p.siglas} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium w-full">
                    <div className="flex items-center">
                      <span
                        className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="break-words">{p.siglas}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(100, pctNum)}%`,
                          backgroundColor: p.color,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center font-bold text-gray-900 bg-gray-50 whitespace-nowrap">
                    {p.escanos}
                  </td>
                  <td
                    className={`px-2 py-2 text-center font-semibold text-xs whitespace-nowrap ${
                      dif > 0
                        ? 'text-green-700'
                        : dif < 0
                        ? 'text-red-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {dif > 0 ? `+${dif}` : dif === 0 ? '=' : dif}
                  </td>
                  {hasVotos && (
                    <>
                      <td className="px-2 py-2 text-right font-mono text-xs text-gray-600 whitespace-nowrap">
                        {p.votos.toLocaleString('es-ES')}
                      </td>
                      <td className="px-2 py-2 text-right font-mono whitespace-nowrap">
                        {p.porc}
                      </td>
                    </>
                  )}
                  <td className="px-2 py-2 text-center text-gray-500 whitespace-nowrap hidden sm:table-cell">
                    {oldEsc}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PactometroCard = ({
  region,
  camara,
  selectedSiglas,
  onToggle,
  onClear,
}: {
  region: RegionData;
  camara: Camara;
  selectedSiglas: string[];
  onToggle: (siglas: string) => void;
  onClear: () => void;
}) => {
  const partidosConEscano = region.partidos.filter((p) => p.escanos > 0);
  const selectedParties = partidosConEscano
    .filter((p) => selectedSiglas.includes(p.siglas))
    .sort((a, b) => b.escanos - a.escanos);

  const totalEscanos =
    region.total_dip > 0
      ? region.total_dip
      : partidosConEscano.reduce((acc, p) => acc + p.escanos, 0);
  const escanosPacto = selectedParties.reduce((acc, p) => acc + p.escanos, 0);
  const votosPacto = selectedParties.reduce((acc, p) => acc + p.votos, 0);
  const hasVotos = partidosConEscano.some((p) => p.votos > 0);
  const restantes = Math.max(0, totalEscanos - escanosPacto);
  const alcanzaMayoria = escanosPacto >= region.mayoria;
  const labelUnidad = camara === 'senado' ? 'senadores' : 'escaños';

  const chartLabels = [
    ...selectedParties.map((p) => p.siglas),
    ...(restantes > 0 ? ['Resto / Oposición'] : []),
  ];
  const chartValues = [
    ...selectedParties.map((p) => p.escanos),
    ...(restantes > 0 ? [restantes] : []),
  ];
  const chartColors = [
    ...selectedParties.map((p) => p.color),
    ...(restantes > 0 ? ['#E5E7EB'] : []),
  ];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: chartColors,
        borderWidth: 2,
        borderColor: '#ffffff',
        cutout: '58%',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    cutout: '58%',
    layout: {
      padding: { top: 24, bottom: 10 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx: { label: string; raw: unknown }) =>
            `${ctx.label}: ${ctx.raw} ${labelUnidad}`,
        },
      },
      datalabels: {
        labels: {
          valor: {
            color: (ctx: { dataIndex: number }) =>
              ctx.dataIndex < selectedParties.length ? '#ffffff' : 'transparent',
            font: { weight: 'bold' as const, size: 13 },
            formatter: (value: number, ctx: { dataIndex: number }) =>
              ctx.dataIndex < selectedParties.length && value > 0 ? value : '',
            align: 'center' as const,
            anchor: 'center' as const,
          },
        },
      },
    },
  };

  return (
    <section className="mt-6 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Pactómetro de Mayorías · {region.nombre}
          </h3>
          <p className="text-xs text-gray-500">
            Pulsa en los partidos para formar gobierno y comprobar si alcanzan la mayoría absoluta (
            <strong>{region.mayoria}</strong> {labelUnidad})
          </p>
        </div>
        <div className="text-right">
          <span
            className={`text-2xl font-extrabold ${
              alcanzaMayoria ? 'text-green-600' : 'text-gray-900'
            }`}
          >
            {escanosPacto}
          </span>
          <span className="text-sm text-gray-500"> / {region.mayoria}</span>
        </div>
      </div>

      {/* SEMICÍRCULO DEL PACTÓMETRO CON MARCA DE MAYORÍA ABSOLUTA */}
      <div className="relative h-64 sm:h-72 w-full max-w-xl mx-auto my-2">
        {/* Etiqueta y línea discontinua de mayoría absoluta (50% del semicírculo) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs whitespace-nowrap ${
              alcanzaMayoria
                ? 'bg-green-50 text-green-700 border-green-400'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            Mayoría: {region.mayoria}
          </span>
          <div
            className={`h-20 sm:h-24 border-l-2 border-dashed mt-0.5 ${
              alcanzaMayoria ? 'border-green-500' : 'border-gray-500'
            }`}
          />
        </div>

        <Doughnut data={chartData as never} options={chartOptions as never} />

        {/* Resumen central dentro del semicírculo */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center pointer-events-none w-56">
          <div
            className={`text-3xl sm:text-4xl font-extrabold leading-none ${
              alcanzaMayoria
                ? 'text-green-600'
                : escanosPacto > 0
                ? 'text-orange-600'
                : 'text-gray-400'
            }`}
          >
            {escanosPacto}
            <span className="text-base font-semibold text-gray-400">
              /{totalEscanos}
            </span>
          </div>
          <div className="mt-1">
            {alcanzaMayoria ? (
              <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                ¡Mayoría absoluta! (+{escanosPacto - region.mayoria})
              </span>
            ) : escanosPacto > 0 ? (
              <span className="inline-block bg-orange-50 text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Faltan {region.mayoria - escanosPacto} para mayoría
              </span>
            ) : (
              <span className="text-xs text-gray-400">
                Selecciona partidos abajo
              </span>
            )}
          </div>
          {hasVotos && votosPacto > 0 && (
            <div className="text-[11px] font-mono text-gray-500 mt-1">
              {votosPacto.toLocaleString('es-ES')} votos sumados
            </div>
          )}
        </div>
      </div>

      {/* SELECTOR DE PARTIDOS */}
      <div className="flex flex-wrap gap-2 justify-center mt-4 pt-4 border-t border-gray-100">
        {partidosConEscano.map((p) => {
          const active = selectedSiglas.includes(p.siglas);
          return (
            <button
              key={p.siglas}
              type="button"
              onClick={() => onToggle(p.siglas)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                active
                  ? 'text-white shadow-sm scale-105'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
              style={
                active
                  ? { backgroundColor: p.color, borderColor: p.color }
                  : undefined
              }
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: active ? '#ffffff' : p.color }}
              />
              <span>{p.siglas}</span>
              <span className="opacity-85">({p.escanos})</span>
            </button>
          );
        })}
        {selectedSiglas.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-gray-800 underline"
          >
            Limpiar
          </button>
        )}
      </div>
    </section>
  );
};
