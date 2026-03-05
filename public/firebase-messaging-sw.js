// Archivo: /public/firebase-messaging-sw.js

// Importamos los scripts directamente desde el CDN de Google
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Configuración de tu proyecto (la encuentras en la consola de Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyAuVeyEJ_hflI3yAaWsT2B5IQOVGHw85o8",
  authDomain: "periodiconaranja-74484.firebaseapp.com",
  projectId: "periodiconaranja-74484",
  storageBucket: "periodiconaranja-74484.appspot.com",
  messagingSenderId: "108011034403",
  appId: "1:108011034403:web:32752d54a6d29905361e96",
  measurementId: "G-EXQG3C9DR3",
};

// Inicializamos Firebase en el Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Manejamos las notificaciones cuando la web está cerrada o en segundo plano
messaging.onMessage((payload) => {
  console.log('Notificación recibida en segundo plano:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'Icon-192.png' // Pon aquí la ruta al logo de tu periódico que esté en /public
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});