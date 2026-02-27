"use client"; // Importante para Next.js App Router

import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  getColor,
  getIdeologia,
  RegionData,
  PartidoData,
} from "@/Types/Elecciones";
import Header from "@/app/Header";
import MapaCastillaLeon from "../ui/MapaCastillaLeon";

// Registro de gráficos
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// --- CONFIGURACIÓN ---


/**
 * Componente Principal `EscrutinioTotal`
 * 
 * Este componente se encarga de mostrar los resultados electorales en tiempo real.
 * Funciona haciendo "polling" (peticiones periódicas) a un archivo CSV que contiene
 * el escrutinio actualizado, lo procesa y lo visualiza tanto a nivel general (Castilla y León)
 * como desglosado por cada una de las 9 provincias.
 */
function EscrutinioTotal() {
  // `data` almacena los datos actuales del escrutinio estructurados por provincia y comunidad
  const [data, setData] = useState<{
    autonomica: RegionData | null;
    avila: RegionData | null;
    burgos: RegionData | null;
    leon: RegionData | null;
    palencia: RegionData | null;
    salamanca: RegionData | null;
    segovia: RegionData | null;
    soria: RegionData | null;
    valladolid: RegionData | null;
    zamora: RegionData | null;
  }>({
    autonomica: null, avila: null, burgos: null, leon: null,
    palencia: null, salamanca: null, segovia: null, soria: null,
    valladolid: null, zamora: null
  });


  // `oldData` almacena datos de resultados electorales anteriores (ej. elecciones de 2022)
  // para poder mostrarlos en el gráfico y compararlos visualmente con el escrutinio actual.
  const [oldData, setOldData] = useState<{
    autonomica: RegionData | null;
    avila: RegionData | null;
    burgos: RegionData | null;
    leon: RegionData | null;
    palencia: RegionData | null;
    salamanca: RegionData | null;
    segovia: RegionData | null;
    soria: RegionData | null;
    valladolid: RegionData | null;
    zamora: RegionData | null;
  }>({
    autonomica: null, avila: null, burgos: null, leon: null,
    palencia: null, salamanca: null, segovia: null, soria: null,
    valladolid: null, zamora: null
  });


  // Estado para controlar la visibilidad y el contenido del Tooltip (ventana emergente)
  // que aparece al pasar el ratón ("hover") sobre una provincia en el mapa.
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    provincia: string | null;
    data: RegionData | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    provincia: null,
    data: null,
  });

  /**
   * Manejador del evento hover sobre las provincias del mapa SVG.
   * Actualiza la posición (coordenadas XY) y los datos electorales del tooltip
   * en función de la provincia sobre la que se posicione el usuario.
   * 
   * @param provincia - Clave identificadora de la provincia (ej. 'valladolid').
   * @param e - Evento de ratón de React para obtener las coordenadas en pantalla.
   */
  const handleMapHover = (provincia: string | null, e: React.MouseEvent | null) => {
    if (provincia && e) {
      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        provincia: provincia,
        data: data[provincia as keyof typeof data] as RegionData | null,
      });
    } else {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  };

  const [loading, setLoading] = useState(true); // Controla el estado de carga inicial
  const [envio, setEnvio] = useState("-"); // Muestra el número de fichero/envío recibido desde el servidor
  const fechaActual = new Date();
  const [fechaVencimiento] = useState(new Date("2025-12-21T10:00:00")); // Formato YYYY-MM-DD

  // --- FUNCIÓN DE CARGA ---
  /**
   * Función asíncrona principal encargada de la obtención de los datos electorales.
   * Realiza tres tareas fundamentales para mantener el panel actualizado:
   * 1. Consulta el servidor (proxy) para identificar cuál es el último archivo de envío (ej. "001").
   * 2. Descarga el CSV con los datos del escrutinio actual utilizando ese número de envío.
   * 3. Descarga el CSV de datos históricos para comparar (resultados de elecciones anteriores).
   * 4. Interpreta y decodifica (UTF-8 a partir de ISO-8859-1 en origen) la respuesta.
   */
  const fetchData = async () => {
    try {
      // 1. OBTENER EL NÚMERO DE ENVÍO MÁS RECIENTE
      // Llamamos a nuestro proxy interno en modo 'check' para saber cuál es el último archivo generado
      // Ya no ponemos credenciales aquí, el proxy las tiene ocultas
      const resEnvio = await fetch("/api/elecciones/cyl?mode=check");

      let numEnvio = "001";
      if (resEnvio.ok) {
        const text = await resEnvio.text();
        // Limpiamos comillas o espacios que a veces se cuelan
        numEnvio = text.replace(/['"]+/g, "").trim() || "001";

        // Si el servidor devuelve 0, forzamos 001
        if (numEnvio === "0") numEnvio = "001";
      }
      setEnvio(numEnvio);

      // 2. DESCARGAR LOS ARCHIVOS CSV (ACTUAL Y ANTIGUO)
      // Usamos el número de envío obtenido para descargar el CSV correcto con los datos actuales
      const resCsv = await fetch(
        `/api/elecciones/cyl?mode=download&id=${numEnvio}`
      );

      if (!resCsv.ok) throw new Error("Error descargando CSV desde Proxy");

      // Decodificar
      const buffer = await resCsv.arrayBuffer();
      // ¡AQUÍ ESTÁ LA CLAVE! El ministerio del interior manda los CSV en ISO-8859-1
      // Tu PHP hacía: mb_convert_encoding(..., 'UTF-8', 'ISO-8859-1')
      // En JS hacemos lo mismo usando el TextDecoder correcto:
      const decoder = new TextDecoder("utf-8");
      const csvText = decoder.decode(buffer);

      const resOldData = await fetch("/api/elecciones/cyl?mode=oldData");
      if (!resOldData.ok) throw new Error("Error en datos antiguos");
      const arrayBufferOldData = await resOldData.arrayBuffer();

      const decoderOldData = new TextDecoder("utf-8");
      const csvTextOldData = decoderOldData.decode(arrayBufferOldData);

      // 3. PARSEAR LOS ARCHIVOS CSV
      // Utilizamos la librería PapaParse para convertir el texto CSV (separado por punto y coma)
      // en un array bidimensional en JavaScript.
      Papa.parse(csvTextOldData, {
        delimiter: ";",
        complete: async (results) => {
          await procesarDatos(results.data as string[][], true);
        },
      });

      // Parsear el CSV Principal (Actual)
      Papa.parse(csvText, {
        delimiter: ";",
        complete: async (results) => {
          await procesarDatos(results.data as string[][], false);
        },
      });
    } catch (error) {
      console.error("Error en polling:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE PROCESAMIENTO ---
  /**
   * Procesa la matriz bidimensional originada al parsear el CSV por `PapaParse`
   * y la transforma en la estructura formal (`RegionData`) que demanda el componente.
   * Agrupa los datos identificando la región a la que pertenecen, suma escaños totales,
   * formatea porcentajes y recupera información visual/técnica (color e ideología).
   * 
   * @param rows - Matriz de datos puros obtenidos desde el CSV de Interior.
   * @param isOldData - Determina si los datos procesados son del histórico (true) o directos (false).
   */
  const procesarDatos = async (rows: string[][], isOldData: boolean = false) => {
    const tempResults: any = {
      autonomica: null, avila: null, burgos: null, leon: null,
      palencia: null, salamanca: null, segovia: null, soria: null,
      valladolid: null, zamora: null
    };

    // Recorremos cada fila (registro) del Excel/CSV
    for (const col of rows) {
      if (!col || col.length < 20) continue; // Evitamos filas vacías o inválidas

      let regionKey = "";
      const tipoEleccion = col[1]; // Puede ser 'CM' (Comunidad) o 'PR' (Provincia)
      const codProv = col[3]; // Código postal/provincial identificador (ej: '05' para Ávila)

      // Dependiendo del tipo de registro y del código de provincia,
      // asignamos a qué "llave" del objeto temporal irá esta información.
      if (tipoEleccion === "CM") regionKey = "autonomica";
      else if (tipoEleccion === "PR") {
        if (codProv === "05") regionKey = "avila";
        else if (codProv === "09") regionKey = "burgos";
        else if (codProv === "24") regionKey = "leon";
        else if (codProv === "34") regionKey = "palencia";
        else if (codProv === "37") regionKey = "salamanca";
        else if (codProv === "40") regionKey = "segovia";
        else if (codProv === "42") regionKey = "soria";
        else if (codProv === "47") regionKey = "valladolid";
        else if (codProv === "49") regionKey = "zamora";
      }

      // Si encontramos una región válida, extraemos sus datos generales
      if (regionKey) {
        const totalDip = parseInt(col[18]) || 0; // Total de escaños/diputados en juego
        // Formateamos el porcentaje escrutado (ej: 98.45 -> 98,45%)
        const escrutado =
          (parseFloat(col[8]) / 100).toFixed(2).replace(".", ",") + "%";

        const regionData: RegionData = {
          nombre: col[4].trim(), // Nombre de la provincia
          escrutado: escrutado,
          mayoria: Math.floor(totalDip / 2) + 1, // Fórmula de la mayoría absoluta parlamentaria
          total_dip: totalDip,
          partidos: [], // Inicialmente vacío, lo llenaremos abajo
        };

        // Extraer los datos de cada partido político (empieza en el Índice 22 y cada partido ocupa 5 columnas)
        const inicio = 22;
        const partidosPromesas = [];

        for (let i = 0; i < 50; i++) {
          const idx = inicio + i * 5;
          if (!col[idx + 1]) break;

          const siglas = col[idx + 1].trim();
          const votos = parseInt(col[idx + 2]);
          const escanos = parseInt(col[idx + 4]);

          // CSV Porcentaje viene como "5045" -> 50.45
          const rawPorc = parseFloat(col[idx + 3].replace(",", "."));
          const porcTxt = (rawPorc / 100).toFixed(2).replace(".", ",") + "%";

          if (siglas) {
            partidosPromesas.push(
              (async () => {
                const color = await getColor(siglas);
                const ideologiaTexto = await getIdeologia(siglas);
                const ideologia = Number(ideologiaTexto) || 3.5;

                return {
                  siglas,
                  escanos,
                  votos,
                  porc: porcTxt,
                  color,
                  ideologia,
                };
              })()
            );
          }
        }

        // Ejecutamos las promesas para sacar el color e ideología de cada partido de forma asíncrona
        const partidosResueltos = await Promise.all(partidosPromesas);
        regionData.partidos.push(...partidosResueltos);

        // Ordenar los partidos por el número de votos (de mayor a menor) para que salgan correctos en la tabla
        regionData.partidos.sort((a, b) => b.votos - a.votos);
        tempResults[regionKey] = regionData;
      }
    }

    // Finalmente actualizamos el ESTADO con los resultados formateados
    if (isOldData) {
      setOldData(tempResults);
    } else {
      setData(tempResults);
    }
  };

  /**
   * Calcula de forma robusta qué partido ha resultado ganador en una provincia dada
   * para pintar adecuadamente dicha provincia en el mapa SVG.
   * Contempla reglas de desempate en cascada si dos partidos igualan en escaños provinciales:
   * 1. Se comparan los escaños a nivel global autonómico.
   * 2. Si empatan en escaños autonómicos, se comparan sus votos autonómicos.
   * 3. Si aún así hubiera empate, finalmente se decide por los votos puramente provinciales.
   *
   * @param region - El dataset de la provincia en sí (datos provinciales).
   * @param autonomica - El dataset global (Castilla y León).
   * @returns El color (hexadecimal) del ganador absoluto de la región o gris ("#d1d5db") por defecto.
   */
  const getColorGanador = (region: RegionData | null, autonomica: RegionData | null) => {
    if (!region || !region.partidos || region.partidos.length === 0) return "#d1d5db";
    const ganadores = [...region.partidos].sort((a, b) => {
      // Diferencia local prioritaria
      if (b.escanos !== a.escanos) return b.escanos - a.escanos;

      // Empate a escaños: romper con votos (o escaños globales, según pidan)
      // Como nos piden que si hay EMPATE en escaños provinciales, decidamos por GLOBAL:
      if (autonomica?.partidos) {
        const aGlobal = autonomica.partidos.find(p => p.siglas === a.siglas);
        const bGlobal = autonomica.partidos.find(p => p.siglas === b.siglas);

        const aEscGlobal = aGlobal ? aGlobal.escanos : 0;
        const bEscGlobal = bGlobal ? bGlobal.escanos : 0;

        if (bEscGlobal !== aEscGlobal) return bEscGlobal - aEscGlobal;

        const aVotGlobal = aGlobal ? aGlobal.votos : 0;
        const bVotGlobal = bGlobal ? bGlobal.votos : 0;
        if (bVotGlobal !== aVotGlobal) return bVotGlobal - aVotGlobal;
      }

      // En última instancia, votos provinciales:
      if (b.votos !== a.votos) return b.votos - a.votos;
      return 0;
    });

    if (ganadores[0].escanos > 0 || ganadores[0].votos > 0) return ganadores[0].color;
    return "#d1d5db";
  };



  // --- POLLING (Cada 60s) ---
  useEffect(() => {
    fetchData(); // Carga inicial
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data.autonomica)
    return <div className="p-10 text-center">Cargando Escrutinio...</div>;



  return (
    <>
      <div className="max-w-5xl mx-auto p-4 bg-gray-50 rounded-xl shadow-sm">
        {tooltip.visible && tooltip.data && (
          <div
            className="fixed bg-gray-900/90 text-white p-3 rounded-lg shadow-xl z-50 pointer-events-none border border-gray-700 backdrop-blur-sm"
            style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}
          >
            <div className="font-bold mb-2 border-b border-gray-600 pb-1 pr-4">
              {tooltip.provincia === 'leon' ? 'León'
                : tooltip.provincia === 'zamora' ? 'Zamora'
                  : tooltip.provincia === 'salamanca' ? 'Salamanca'
                    : tooltip.provincia === 'valladolid' ? 'Valladolid'
                      : tooltip.provincia === 'palencia' ? 'Palencia'
                        : tooltip.provincia === 'burgos' ? 'Burgos'
                          : tooltip.provincia === 'soria' ? 'Soria'
                            : tooltip.provincia === 'segovia' ? 'Segovia'
                              : tooltip.provincia === 'avila' ? 'Ávila'
                                : tooltip.provincia}
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between w-full mb-2 text-gray-300">
                <span className="mr-4">Escrutado:</span>
                <span>{tooltip.data.escrutado}</span>
              </div>
              {tooltip.data.partidos.slice(0, 3).map((p, i) => (
                <div key={i} className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                    <span>{p.siglas}</span>
                  </div>
                  <div className="flex gap-3 text-right">
                    <span className="w-8">{p.escanos} dip</span>
                    <span className="w-10 text-gray-400">{p.porc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <header className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Elecciones Castilla y León 2026
          </h2>
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">
            EN DIRECTO
          </span>
        </header>
        {data.autonomica && (
          <RegionCard
            data={data.autonomica}
            oldData={oldData.autonomica}
            title="Castilla y León (Global)"
            isMain={true}
          />
        )}

        {/* GRID PROVINCIAS */}
        <div className="mt-8 border rounded-lg p-4 bg-white shadow-sm flex justify-center h-[675px]">
          <MapaCastillaLeon
            onHover={handleMapHover}
            colores={{
              avila: getColorGanador(data.avila, data.autonomica),
              burgos: getColorGanador(data.burgos, data.autonomica),
              leon: getColorGanador(data.leon, data.autonomica),
              palencia: getColorGanador(data.palencia, data.autonomica),
              salamanca: getColorGanador(data.salamanca, data.autonomica),
              segovia: getColorGanador(data.segovia, data.autonomica),
              soria: getColorGanador(data.soria, data.autonomica),
              valladolid: getColorGanador(data.valladolid, data.autonomica),
              zamora: getColorGanador(data.zamora, data.autonomica),
            }}
          />
        </div>
      </div>
    </>
  );
}

// --- SUBCOMPONENTE DE TARJETA ---
/**
 * Componente funcional `RegionCard`. Instanciado para cada demarcación (Autonómica o Provincial).
 * Se centra en el renderizado visual de resultados agrupados presentando un "Hemiciclo" (Doughnut Chart)
 * comparativo mediante anillos concéntricos y una tabla analítica detallada de votaciones.
 *
 * Incluye un algoritmo propio que unifica el catálogo de partidos presentes y pasados 
 * y los ordena siempre de izquierda a derecha (usando el índice ideológico de cada partido).
 *
 * @param props.data - Dataset base con los datos electorales del escrutinio en curso.
 * @param props.oldData - Dataset histórico (pasado) de la mis región para cargar el segundo anillo comparativo.
 * @param props.title - El título a mostrar en el frontal de la tarjeta.
 * @param props.isMain - Cuando es `true`, modifica los estilos (tamaño y contornos) haciéndola tarjeta principal.
 */
const RegionCard = ({
  data,
  oldData,
  title,
  isMain = false,
}: {
  data: RegionData;
  oldData?: RegionData | null;
  title: string;
  isMain?: boolean;
}) => {
  // PREPARAR GRÁFICO (DOBLE ESCRUTINIO):
  // 1. Unificamos todos los partidos que tienen escaños (tanto actuales como antiguos)
  // para que los índices de ambos anillos coincidan perfectamente y las tooltips no se mezclen.
  const unifiedMap = new Map<string, PartidoData>();

  [...(data.partidos || []), ...(oldData?.partidos || [])].forEach((p) => {
    if (p.escanos > 0) {
      if (!unifiedMap.has(p.siglas)) {
        unifiedMap.set(p.siglas, p);
      }
    }
  });

  // 2. Ordenamos todos los partidos de Izquierda a Derecha (Hemiciclo ordenado)
  const unifiedParties = Array.from(unifiedMap.values()).sort((a, b) => a.ideologia - b.ideologia);

  // 3. Mapeamos correspondencias: si un partido no sacó escaños en un año, le ponemos 0.
  const currentSeats = unifiedParties.map(u => {
    const match = data.partidos.find(p => p.siglas === u.siglas);
    return match ? match.escanos : 0;
  });

  const oldSeats = unifiedParties.map(u => {
    const match = oldData?.partidos?.find(p => p.siglas === u.siglas);
    return match ? match.escanos : 0;
  });

  const unifiedColors = unifiedParties.map(u => u.color);
  const unifiedLabels = unifiedParties.map(u => u.siglas);

  // 4. Creamos la configuración del gráfico al estilo de tu CMS. 
  // [0] escaños actuales (Anillo Exterior - 2026)
  // [1] escaños antiguos (Anillo Interior - 2022)
  let chartData: any = {
    labels: unifiedLabels,
    datasets: [
      {
        data: currentSeats,
        backgroundColor: unifiedColors,
        borderWidth: 2,
        borderColor: "#ffffff",
        cutout: "55%", // Grosor del anillo exterior
      }
    ],
  };

  // Si tenemos datos antiguos, añadimos el anillo interior
  if (oldData && oldData.partidos && oldData.partidos.length > 0) {
    chartData.datasets.push({
      data: oldSeats,
      backgroundColor: unifiedColors,
      borderWidth: 2,
      borderColor: "#ffffff",
      cutout: "50%", // Tamaño relativo del hueco respecto a su zona asignada
      radius: "75%", // Cuánto encoge el anillo para estar por dentro (75% del tamaño global)
      opacity: 0.6, // Transparencia que pedías en el código
      datalabels: { display: false } // Ocultamos los números en el anillo interior para no saturar
    });
  }

  // Opciones de configuración de Chart.js para dibujar un arco parlamentario de 180 grados
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90, // Inicia dibujando desde la izquierda (-90 grados)
    circumference: 180, // Solo dibuja media circunferencia (180 grados)
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
        color: "white",
        font: { weight: "bold", size: isMain ? 16 : 14 }, // Tamaño subido a 14 basado en tu código
        // Formateador exacto de tu código
        formatter: (value: any) => (value > 0 ? value : ""),
      },
    },
  };
  const escrutadoMatch = data.escrutado.match(/<strong>(.*?)<\/strong>/);
  const escrutado = escrutadoMatch ? escrutadoMatch[1] : '100%';
  return (
    <div
      className={`bg-white p-4 rounded-lg border ${isMain ? "border-blue-200 shadow-md" : "border-gray-200"
        }`}
    >
      <h3
        className={`text-center font-bold mb-2 ${isMain ? "text-xl" : "text-lg"
          }`}
      >
        {title}
      </h3>

      <div className="flex justify-around text-sm text-gray-600 mb-4 font-mono bg-gray-50 p-2 rounded">
        <span>
          Escrutado: <strong>{escrutado}</strong>
        </span>
        <span>
          Mayoría: <strong>{data.mayoria}</strong>
        </span>
      </div>

      <div className={`relative ${isMain ? "h-64" : "h-48"}`}>
        {unifiedParties.length > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Sin Escaños Asignados
          </div>
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
                <td className="px-2 py-2 font-medium flex flex-col gap-1 w-full whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: p.color }}
                    ></span>
                    {(p.siglas === 'IU-MS-VQ') ? "SUMAR" : p.siglas === 'PODEMOS - AV' ? 'PODEMOS' : p.siglas}
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full transition-all duration-500 ease-out"
                      style={{ width: `${parseFloat(p.porc.replace(',', '.'))}%`, backgroundColor: p.color }}
                    />
                  </div>
                </td>
                <td className="px-2 py-2 text-center font-bold text-gray-900 bg-gray-50">
                  {p.escanos}
                </td>
                <td className="px-2 py-2 text-right">{p.porc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EscrutinioTotal;
