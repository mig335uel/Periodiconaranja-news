'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { RegionData } from '@/Types/Elecciones';
import { Camara } from './types';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface PactometroCardProps {
  region: RegionData;
  camara: Camara;
  selectedSiglas: string[];
  onToggle: (siglas: string) => void;
  onClear: () => void;
}

export default function PactometroCard({
  region,
  camara,
  selectedSiglas,
  onToggle,
  onClear,
}: PactometroCardProps) {
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

      {/* Semicírculo con línea discontinua en el 50% (mayoría absoluta) */}
      <div className="relative h-64 sm:h-72 w-full max-w-xl mx-auto my-2">
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

        {/* Resumen central */}
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

      {/* Selector de partidos */}
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
}
