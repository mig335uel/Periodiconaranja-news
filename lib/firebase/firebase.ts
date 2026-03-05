import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';


const firebaseConfig = {
  apiKey: "AIzaSyAuVeyEJ_hflI3yAaWsT2B5IQOVGHw85o8",
  authDomain: "periodiconaranja-74484.firebaseapp.com",
  projectId: "periodiconaranja-74484",
  storageBucket: "periodiconaranja-74484.appspot.com",
  messagingSenderId: "108011034403",
  appId: "1:108011034403:web:32752d54a6d29905361e96",
  measurementId: "G-EXQG3C9DR3",
  databaseURL:
    "https://periodiconaranja-74484-default-rtdb.europe-west1.firebasedatabase.app/",
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const solicitarTokenFirebase = async (): Promise<string | null> => {
  try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const messaging: Messaging = getMessaging(app);
      
      const currentToken = await getToken(messaging, { 
        // Usamos la variable de entorno para el Vapid Key también
        vapidKey: process.env.VAPID_KEY
      });
      
      if (currentToken) {
        return currentToken; 
      } else {
        console.log('No se pudo obtener el token. Pide permiso al usuario.');
        return null;
      }
    }
    return null;
  } catch (err) {
    console.error('Error obteniendo el token', err);
    return null;
  }
};