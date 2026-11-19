'use client';

import React, { useMemo, useState } from 'react';
import { RegionData } from '@/Types/Elecciones';
import { AmbitoTerritorial, Camara, TerritorialEntry } from './types';
import { getColorGanador } from './parser';

interface DesgloseTerritorialProps {
  camara: Camara;
  espana: RegionData | null;
  comunidades: TerritorialEntry[];
  provincias: TerritorialEntry[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export default function DesgloseTerritorial({
  camara,
  espana,
  comunidades,
  provincias,
  selectedKey,
  onSelect,
}: DesgloseTerritorialProps) {
  const [ambitoTab, setAmbitoTab] = useState<AmbitoTerritorial>('provincias');
  const [busqueda, setBusqueda] = useState('');

  const filteredTerritories = useMemo(() => {
    const list = ambitoTab === 'comunidades' ? comunidades : provincias;
    const q = busqueda.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => item.region.nombre.toLowerCase().includes(q));
  }, [ambitoTab, busqueda, comunidades, provincias]);

  return (
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
            {camara === 'senado' ? 'Circunscripciones' : 'Provincias'} ({provincias.length})
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
            Comunidades Autónomas ({comunidades.length})
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
          const winColor = getColorGanador(item.region, espana);
          const isSelected = selectedKey === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
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
  );
}
