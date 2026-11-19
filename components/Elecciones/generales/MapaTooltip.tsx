'use client';

import React from 'react';
import { RegionData } from '@/Types/Elecciones';

interface MapaTooltipProps {
  visible: boolean;
  x: number;
  y: number;
  region: RegionData | null;
}

export default function MapaTooltip({ visible, x, y, region }: MapaTooltipProps) {
  if (!visible || !region) return null;

  return (
    <div
      className="fixed bg-gray-900/90 text-white p-3 rounded-lg shadow-xl z-50 pointer-events-none border border-gray-700 backdrop-blur-sm min-w-[200px]"
      style={{ top: y + 15, left: x + 15 }}
    >
      <div className="font-bold mb-2 border-b border-gray-600 pb-1">
        {region.nombre}
      </div>
      <div className="text-xs space-y-1">
        <div className="flex justify-between w-full mb-2 text-gray-300">
          <span>Escrutado:</span>
          <span>{region.escrutado}</span>
        </div>
        {region.partidos.slice(0, 3).map((p) => (
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
              {p.votos > 0 && <span className="text-gray-400">{p.porc}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
