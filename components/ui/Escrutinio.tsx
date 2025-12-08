'use client'; // Importante para Next.js App Router

import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getColor, getIdeologia, RegionData, PartidoData } from '@/Types/Elecciones';
import Header from '@/app/Header';


// Registro de gráficos
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// --- CONFIGURACIÓN ---


function EscrutinioWidget () {
  const [data, setData] = useState<{
    autonomica: RegionData | null;
    badajoz: RegionData | null;
    caceres: RegionData | null;
  }>({ autonomica: null, badajoz: null, caceres: null });

  const [loading, setLoading] = useState(true);
  const [envio, setEnvio] = useState('-');

  // --- FUNCIÓN DE CARGA ---
const fetchData = async () => {
    try {
      // 1. LLAMADA INTERNA A TU PROXY (Modo Check)
      // Ya no ponemos credenciales aquí, el proxy las tiene ocultas
      const resEnvio = await fetch('/api/elecciones?mode=check');
      
      let numEnvio = '001';
      if (resEnvio.ok) {
        const text = await resEnvio.text();
        // Limpiamos comillas o espacios que a veces se cuelan
        numEnvio = text.replace(/['"]+/g, '').trim() || '001';
        
        // Si el servidor devuelve 0, forzamos 001
        if (numEnvio === '0') numEnvio = '001';
      }
      setEnvio(numEnvio);

      // 2. LLAMADA INTERNA A TU PROXY (Modo Download)
      const resCsv = await fetch(`/api/elecciones?mode=download&id=${numEnvio}`);

      if (!resCsv.ok) throw new Error('Error descargando CSV desde Proxy');

      // Decodificar (Importante para tildes)
      const buffer = await resCsv.arrayBuffer();
      const decoder = new TextDecoder('iso-8859-1'); 
      const csvText = decoder.decode(buffer);

      // 3. Parsear CSV con PapaParse
      Papa.parse(csvText, {
        delimiter: ';',
        complete: (results) => {
          procesarDatos(results.data as string[][]);
        }
      });

    } catch (error) {
      console.error("Error en polling:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE PROCESAMIENTO (Igual que PHP V16) ---
  const procesarDatos = (rows: string[][]) => {
    const tempResults: any = { autonomica: null, badajoz: null, caceres: null };

    rows.forEach((col) => {
      if (!col || col.length < 20) return;

      let regionKey = '';
      if (col[1] === 'CM') regionKey = 'autonomica';
      else if (col[1] === 'PR' && col[3] === '06') regionKey = 'badajoz';
      else if (col[1] === 'PR' && col[3] === '10') regionKey = 'caceres';

      if (regionKey) {
        const totalDip = parseInt(col[18]) || 0;
        const escrutado = (parseFloat(col[8]) / 100).toFixed(2).replace('.', ',') + '%';
        
        const regionData: RegionData = {
            nombre: col[4], // Nombre provincia
            escrutado: escrutado,
            mayoria: Math.floor(totalDip / 2) + 1,
            total_dip: totalDip,
            partidos: []
        };

        // Leer partidos (Index 22)
        const inicio = 22;
        for (let i = 0; i < 50; i++) {
            const idx = inicio + (i * 5);
            if (!col[idx + 1]) break;

            const siglas = col[idx + 1].trim();
            const votos = parseInt(col[idx + 2]);
            const escanos = parseInt(col[idx + 4]);
            
            // CSV Porcentaje viene como "5045" -> 50.45
            const rawPorc = parseFloat(col[idx + 3].replace(',', '.'));
            const porcTxt = (rawPorc / 100).toFixed(2).replace('.', ',') + '%';

            if (siglas) {
                regionData.partidos.push({
                    siglas,
                    escanos,
                    votos,
                    porc: porcTxt,
                    color: getColor(siglas),
                    ideologia: getIdeologia(siglas)
                });
            }
        }
        
        // Ordenar por Votos para la tabla
        regionData.partidos.sort((a, b) => b.votos - a.votos);
        tempResults[regionKey] = regionData;
      }
    });

    setData(tempResults);
  };

  // --- POLLING (Cada 60s) ---
  useEffect(() => {
    fetchData(); // Carga inicial
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data.autonomica) return <div className="p-10 text-center">Cargando Escrutinio...</div>;

  return (
    <>

        <div className="max-w-5xl mx-auto p-4 bg-gray-50 rounded-xl shadow-sm">
        <header className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Elecciones Extremadura 2025</h2>
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">
            EN DIRECTO
            </span>
        </header>

        {/* BLOQUE PRINCIPAL */}
        {data.autonomica && (
            <RegionCard data={data.autonomica} title="Extremadura (Global)" isMain={true} />
        )}

        {/* GRID PROVINCIAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {data.badajoz && <RegionCard data={data.badajoz} title="Badajoz" />}
            {data.caceres && <RegionCard data={data.caceres} title="Cáceres" />}
        </div>
        </div>
    </>
  );
};

// --- SUBCOMPONENTE DE TARJETA ---
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

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-100 text-gray-700">
            <tr>
              <th className="px-2 py-2">Partido</th>
              <th className="px-2 py-2 text-center">Escaños</th>
              <th className="px-2 py-2 text-right">% Voto</th>
            </tr>
          </thead>
          <tbody>
            {data.partidos.map((p, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-2 py-2 font-medium flex items-center">
                  <span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: p.color}}></span>
                  {p.siglas}
                </td>
                <td className="px-2 py-2 text-center font-bold text-gray-900 bg-gray-50">{p.escanos}</td>
                <td className="px-2 py-2 text-right">{p.porc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EscrutinioWidget;