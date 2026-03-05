'use client';

import { useState, useEffect } from 'react';
import { solicitarTokenFirebase } from '@/lib/firebase/firebase';

export default function TarjetaSuscripcion() {
  const [cargando, setCargando] = useState(false);
  const [estaSuscrito, setEstaSuscrito] = useState(false);
  const [montado, setMontado] = useState(false); 
  
  // ¡Fijado a tu topic real!
  const tema = "news"; 

  useEffect(() => {
    setMontado(true); 
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      // Simplificamos el nombre de la variable guardada
      const estadoSuscripcion = localStorage.getItem('notificaciones_periodico');
      const permisoNavegador = Notification.permission;

      if (estadoSuscripcion === 'true') {
        if (permisoNavegador === 'granted') {
          setEstaSuscrito(true);
        } else {
          localStorage.removeItem('notificaciones_periodico');
          setEstaSuscrito(false);
        }
      }
    }
  }, []);

  const suscribirse = async () => {
    setCargando(true);
    try {
      const token = await solicitarTokenFirebase();
      
      if (!token) {
        alert('Por favor, permite las notificaciones en tu navegador.');
        setCargando(false);
        return;
      }

      const respuesta = await fetch('https://api.periodiconaranja.es/api/suscribirseatopic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, topic: tema }),
      });

      if (respuesta.ok) {
        alert('¡Genial! Te has apuntado correctamente a las alertas de noticias.');
        localStorage.setItem('notificaciones_periodico', 'true');
        setEstaSuscrito(true); 
      } else {
        alert('Hubo un problema al apuntarte. Inténtalo de nuevo.');
      }
      
    } catch (error) {
      alert('Error de conexión.');
    } finally {
      setCargando(false);
    }
  };

  if (!montado) return null;
  if (estaSuscrito) return null; 

  return (
    <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-lg p-8 text-white text-center shadow-lg transform hover:-translate-y-1 transition-transform">
      <h4 className="font-bold text-2xl mb-2">Suscríbete</h4>
      <p className="text-orange-100 text-sm mb-6">
        Recibe las últimas noticias directamente en tu dispositivo.
      </p>
      <button 
        onClick={suscribirse}
        disabled={cargando}
        className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition w-full shadow-md disabled:opacity-75 disabled:cursor-not-allowed flex justify-center items-center"
      >
        {cargando ? <span className="animate-pulse">Activando...</span> : 'Apuntarme'}
      </button>
    </div>
  );
}