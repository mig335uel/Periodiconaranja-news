"use client";

import { EleccionesData, RegionData } from '@/Types/Elecciones';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';



ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);






export default function EscrutinioWidget({ election_data }: { election_data: any }) {


  const [data, setData] = useState<EleccionesData | null>(null);

  useEffect(() => {
    setData(election_data);
  }, [election_data]);

  if (!data) {
    return <div>Loading...</div>;
  }


  return (
    <div>
      <RegionCard data={data} title="Total" />
    </div>
  );
}



const RegionCard = ({ data, title, isMain = false }: { data: EleccionesData, title: string, isMain?: boolean }) => {

  // Unificar partidos de ambos años para el gráfico (alinear colores y etiquetas)
  const partiesMap = new Map<string, { siglas: string, color: string, ideologia: number, escanos25: number, escanos23: number }>();

  [...(data.data_2025 || [])].forEach(p => {
    if (p.escanos > 0) {
      partiesMap.set(p.siglas, {
        siglas: p.siglas,
        color: p.color,
        ideologia: p.ideologia,
        escanos25: p.escanos,
        escanos23: 0
      });
    }
  });

  [...(data.data_2023 || [])].forEach(p => {
    if (p.escanos > 0) {
      if (partiesMap.has(p.siglas)) {
        partiesMap.get(p.siglas)!.escanos23 = p.escanos;
      } else {
        partiesMap.set(p.siglas, {
          siglas: p.siglas,
          color: p.color,
          ideologia: p.ideologia,
          escanos25: 0,
          escanos23: p.escanos
        });
      }
    }
  });

  const unifiedParties = Array.from(partiesMap.values()).sort((a, b) => a.ideologia - b.ideologia);

  const chartData = {
    labels: unifiedParties.map(p => p.siglas),
    datasets: [{
      data: unifiedParties.map(p => p.escanos25),
      backgroundColor: unifiedParties.map(p => p.color),
      borderWidth: 2,
      borderColor: '#ffffff',
    },
    {
      data: unifiedParties.map(p => p.escanos23),
      backgroundColor: unifiedParties.map(p => p.color),
      borderWidth: 2,
      borderColor: '#ffffff',
      cutout: "50%", // Tamaño relativo del hueco respecto a su zona asignada
      radius: "75%", // Cuánto encoge el anillo para estar por dentro (75% del tamaño global)
      datalabels: {
        display: false,
      }
    }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    cutout: "50%", // El agujero del medio (50% de grosor)
    layout: {
      padding: { bottom: 20 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx: any) => {
            let year = ctx.datasetIndex === 0 ? "2026" : "2022";
            return `${year}: ${ctx.label} (${ctx.raw} dip)`;
          }
        }
      },
      datalabels: {
        labels: {
          sigla: {
            color: "white",
            font: { weight: "normal", size: isMain ? 11 : 9 },
            formatter: (value: any, ctx: any) => (value > 0 ? ctx.chart.data.labels[ctx.dataIndex] : ""),
            align: "top",
            anchor: "center",
            offset: -2,
          },
          valor: {
            color: "white",
            font: { weight: "bold", size: isMain ? 15 : 13 },
            formatter: (value: any) => (value > 0 ? value : ""),
            align: "bottom",
            anchor: "center",
            offset: -2,
          },
        },
      },
    },
  };

  return (
    <div className={`bg-white p-4 rounded-lg border ${isMain ? 'border-blue-200 shadow-md' : 'border-gray-200'}`}>
      <h3 className={`text-center font-bold mb-2 ${isMain ? 'text-xl' : 'text-lg'}`}>{data.name}</h3>

      <div className="flex justify-around text-sm text-gray-600 mb-4 font-mono bg-gray-50 p-2 rounded">
        <span>Escrutado: <strong>{data.escrutado}</strong></span>
      </div>

      <div className={`relative ${isMain ? 'h-64' : 'h-48'}`}>
        {unifiedParties.length > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Sin Escaños Asignados</div>
        )}
      </div>


    </div>
  );
};