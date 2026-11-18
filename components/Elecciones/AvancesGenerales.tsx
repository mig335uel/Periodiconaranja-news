'use client';

import { useState, useEffect } from 'react';
import { DatosAvance } from '@/Types/Elecciones';
import { parseCsvAvances } from '@/utils/csvparser';

export default function AvancesGenerales() {
  const [avances, setAvances] = useState<DatosAvance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const timestamp = Date.now();
      const resCheck = await fetch(`/api/elecciones/generales?mode=check&t=${timestamp}`, {
        cache: 'no-store',
      });
      if (!resCheck.ok) return;

      const envioId = (await resCheck.text()).replace(/['"]+/g, '').trim() || '001';

      const resCsv = await fetch(
        `/api/elecciones/generales?mode=avances&id=${envioId}&t=${timestamp}`,
        { cache: 'no-store' }
      );
      if (!resCsv.ok) return;

      const csvText = await resCsv.text();
      const data = parseCsvAvances(csvText, 'TO', ['14:00', '18:00']);
      if (data) setAvances(data);
    } catch (error) {
      console.error('Error cargando avances generales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 text-center text-gray-500">
        Cargando participación...
      </div>
    );
  }

  if (avances.length === 0) return null;

  return (
    <section className="w-full max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        Avances de Participación · Generales 29N
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {avances.map((dato, i) => {
          const isLast = i === avances.length - 1;
          const pctNumeric = parseFloat(dato.porcentaje.replace(',', '.')) || 0;

          return (
            <div
              key={dato.hora}
              className={`p-6 rounded-lg border shadow-sm transition-all ${
                isLast
                  ? 'bg-white border-orange-500 ring-2 ring-orange-100'
                  : 'bg-gray-50 border-gray-200 opacity-90'
              }`}
            >
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Avance {dato.hora}h
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">
                  {dato.porcentaje}
                </span>
                <span className="text-2xl text-gray-500 font-medium">%</span>

                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden ml-2">
                  <div
                    className="h-full bg-orange-500 transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, pctNumeric)}%` }}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Mesas comunicadas:</span>
                  <span className="font-medium">
                    {dato.mesasComunicadas.toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Censo comunicado:</span>
                  <span className="font-medium">
                    {dato.censoComunicado.toLocaleString('es-ES')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
