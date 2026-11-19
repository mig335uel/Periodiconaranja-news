'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { PartidoData, RegionData } from '@/Types/Elecciones';
import { Camara } from './types';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface RegionCardProps {
  data: RegionData;
  oldData?: RegionData | null;
  camara: Camara;
  title: string;
  isMain?: boolean;
}

export default function RegionCard({
  data,
  oldData,
  camara,
  title,
  isMain = false,
}: RegionCardProps) {
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
}
