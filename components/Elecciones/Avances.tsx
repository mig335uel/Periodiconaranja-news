'use client';

import { useState, useEffect } from 'react';
import { DatosAvance } from '@/Types/Elecciones';
import { parseCsvAvances } from '@/utils/csvparser';

export default function Participacion() {
    const [avances, setAvances] = useState<DatosAvance[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // 1. Preguntar qué envío es el último (check)
            const resCheck = await fetch('/api/elecciones?mode=check');
            const envioId = await resCheck.text();

            // 2. Pedir los avances de ese envío
            const resCsv = await fetch(`/api/elecciones?mode=avances&id=${envioId}`);
            if (!resCsv.ok) throw new Error('Error fetching CSV');

            // 3. Decodificar (Importante para archivos de Windows/Excel en español)
            const buffer = await resCsv.arrayBuffer();
            const decoder = new TextDecoder('iso-8859-1');
            const csvText = decoder.decode(buffer);

            // 4. Parsear
            const data = parseCsvAvances(csvText);
            if (data) setAvances(data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refrescar cada 60s
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-4 text-center">Cargando participación...</div>;
    if (avances.length === 0) return null; // O un mensaje de "Sin datos aún"

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                Avances de Participación
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {avances.map((dato, i) => {
                    // Destacar el último dato disponible
                    const isLast = i === avances.length - 1;

                    return (
                        <div
                            key={i}
                            className={`p-6 rounded-lg border shadow-sm transition-all
                ${isLast ? 'bg-white border-orange-500 ring-2 ring-orange-100' : 'bg-gray-50 border-gray-200 opacity-90'}
              `}
                        >
                            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                {dato.hora}
                            </div>

                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-5xl font-extrabold text-gray-900">
                                    {dato.porcentaje}
                                </span>
                                <span className="text-2xl text-gray-500 font-medium">%</span>

                                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 transition-all duration-500 ease-out"
                                        style={{ width: `${parseFloat(dato.porcentaje.replace(',', '.'))}%` }}
                                    />
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex justify-between">
                                    <span>Mesas:</span>
                                    <span className="font-medium">{dato.mesasComunicadas}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Censo:</span>
                                    <span className="font-medium">{dato.censoComunicado}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}