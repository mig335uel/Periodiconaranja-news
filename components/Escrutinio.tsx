"use client";

import { RegionData } from '@/Types/Elecciones';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';



ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);






export default function EscrutinioWidget({election_data}: {election_data: any}) {


    const [data, setData] = useState<RegionData | null>(null);

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



const RegionCard = ({ data, title, isMain = false }: { data: RegionData, title: string, isMain?: boolean }) => {

  // Preparar datos para el gráfico (Filtrar solo con escaños y ordenar por ideología)
  const chartParties = [...data.partidos]
    .filter(p => p.escanos > 0)
    .sort((a, b) => a.ideologia - b.ideologia);

  const chartData = {
    labels: chartParties.map(p => p.siglas),
    datasets: [{
      data: chartParties.map(p => p.escanos),
      backgroundColor: chartParties.map(p => p.color),
      borderWidth: 2,
      borderColor: '#ffffff',
    }]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    cutout: '50%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      datalabels: {
        color: 'white',
        font: { weight: 'bold', size: isMain ? 16 : 12 },
        display: (ctx: any) => ctx.dataset.data[ctx.dataIndex] > 0
      }
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg border ${isMain ? 'border-blue-200 shadow-md' : 'border-gray-200'}`}>
      <h3 className={`text-center font-bold mb-2 ${isMain ? 'text-xl' : 'text-lg'}`}>{title}</h3>

      <div className="flex justify-around text-sm text-gray-600 mb-4 font-mono bg-gray-50 p-2 rounded">
        <span>Escrutado: <strong>{data.escrutado}</strong></span>
        <span>Mayoría: <strong>{data.mayoria}</strong></span>
      </div>

      <div className={`relative ${isMain ? 'h-64' : 'h-48'}`}>
        {chartParties.length > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Sin Escaños Asignados</div>
        )}
      </div>

      
    </div>
  );
};