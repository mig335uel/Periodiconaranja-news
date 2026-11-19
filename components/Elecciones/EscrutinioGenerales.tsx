'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { getPartidosConfigMap, RegionData } from '@/Types/Elecciones';
import { useAuth } from '@/hooks/useAuth';
import MapaEspana from '../ui/MapaEspana';
import { Camara, EMPTY_DATASET, ParsedGeneralesDataset } from './generales/types';
import { getColorGanador, parseGeneralesCsv } from './generales/parser';
import MapaTooltip from './generales/MapaTooltip';
import RegionCard from './generales/RegionCard';
import PactometroCard from './generales/PactometroCard';
import DesgloseTerritorial from './generales/DesgloseTerritorial';

export default function EscrutinioGenerales() {
  const { user } = useAuth();
  const [camara, setCamara] = useState<Camara>('congreso');
  const [data, setData] = useState<ParsedGeneralesDataset>(EMPTY_DATASET);
  const [oldData, setOldData] = useState<ParsedGeneralesDataset>(EMPTY_DATASET);
  const [selectedKey, setSelectedKey] = useState<string>('TO');
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

  const fechaActual = new Date();
  const [fechadeApertura] = useState(new Date('2026-11-29T20:00:00'));

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

  const handleSelectTerritory = (key: string) => {
    setSelectedKey(key);
    setPactometro([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMapSelect = (codProv: string) => {
    const found = data.provincias.find((p) => p.codigo === codProv);
    if (found) handleSelectTerritory(found.key);
  };

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
          setData(
            parseGeneralesCsv(results.data as string[][], configMap, activeCamara, false)
          );
        },
      });

      if (resOldData.ok) {
        const csvOldText = await resOldData.text();
        Papa.parse(csvOldText, {
          delimiter: ';',
          complete: (results) => {
            setOldData(
              parseGeneralesCsv(results.data as string[][], configMap, activeCamara, true)
            );
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
      <MapaTooltip {...tooltip} />

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
            onClick={() => handleSelectTerritory('TO')}
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

      <section className="mt-8 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">Mapa por provincias</h3>
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

      {activeRegion && activeRegion.partidos.some((p) => p.escanos > 0) && (
        <PactometroCard
          region={activeRegion}
          camara={camara}
          selectedSiglas={pactometro}
          onToggle={togglePacto}
          onClear={() => setPactometro([])}
        />
      )}

      <DesgloseTerritorial
        camara={camara}
        espana={data.espana}
        comunidades={data.comunidades}
        provincias={data.provincias}
        selectedKey={selectedKey}
        onSelect={handleSelectTerritory}
      />
    </div>
  );
}
