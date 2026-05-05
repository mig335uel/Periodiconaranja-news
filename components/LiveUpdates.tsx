"use client"

import { useState, useEffect } from "react";
import type { LiveUpdate } from "@/Types/Posts";
import Pusher from 'pusher-js';

export default function LiveUpdates({ postId, initialUpdates = [] }: { postId: number, initialUpdates?: LiveUpdate[] }) {
    // Inicializamos con los datos que Next.js ya trajo del servidor en la primera carga (SSR)
    const [updates, setUpdates] = useState<LiveUpdate[]>(initialUpdates);

    useEffect(() => {
        // 1. Conectamos con Pusher usando la clave PÚBLICA
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        // 2. Nos suscribimos al "canal" exclusivo de esta noticia
        const channel = pusher.subscribe(`live-updates-${postId}`);

        // 3. Escuchamos cuando entra un NUEVO update
        channel.bind('new-update', (newUpdate: LiveUpdate) => {
            setUpdates((prevUpdates) => {
                // Pequeña protección por si el update ya existía
                if (prevUpdates.some(u => u.id === newUpdate.id)) return prevUpdates;
                
                // Añadimos el nuevo bloque al principio de la lista
                return [newUpdate, ...prevUpdates];
            });
        });

        // 4. Escuchamos cuando se BORRA un update
        channel.bind('delete-update', (deletedId: number | string) => {
            setUpdates((prevUpdates) => prevUpdates.filter(u => Number(u.id) !== Number(deletedId)));
        });

        // Limpiamos la conexión si el usuario cambia de página para no gastar recursos
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, [postId]);

    return (
        <div className="mt-8">
            {updates.length === 0 && (
                <p className="text-gray-500 italic text-center">Esperando actualizaciones...</p>
            )}

            {updates.map((update) => (
                <div key={update.id} className="animate-fade-in mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        {/* Etiqueta de la hora */}
                        <div className="px-3 py-1 text-center bg-orange-600 text-white font-bold rounded-t-md text-sm">
                            {new Date(update.date).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>
                        
                        {/* Título de la actualización (v2.2) */}
                        {update.title && (
                            <div className="article-content">
                                <h3 className="text-xl font-bold text-gray-900 m-0 leading-none">
                                    {update.title}
                                </h3>
                            </div>
                        )}
                    </div>
                    
                    {/* Contenido (HTML) */}
                    <div
                        className="article-content bg-gray-50 p-5 border-l-4 border-orange-600 shadow-sm text-gray-800"
                        dangerouslySetInnerHTML={{ __html: update.content }}
                    ></div>
                </div>
            ))}
        </div>
    );
}