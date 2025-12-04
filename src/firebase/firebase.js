// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

/**
 * Configuración de Firebase tomada exclusivamente de variables de entorno.
 * 
 * IMPORTANTE:
 * - NUNCA poner valores reales (AIza...) en el código ni en public/.
 * - Definir las siguientes env vars en Netlify / entorno:
 *   - REACT_APP_FIREBASE_API_KEY
 *   - REACT_APP_FIREBASE_AUTH_DOMAIN
 *   - REACT_APP_FIREBASE_PROJECT_ID
 *   - REACT_APP_FIREBASE_STORAGE_BUCKET
 *   - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
 *   - REACT_APP_FIREBASE_APP_ID
 *   - REACT_APP_FIREBASE_MEASUREMENT_ID
 */
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Si no hay apiKey configurada, evitamos inicializar Firebase en producción
let messaging = null;

if (firebaseConfig.apiKey) {
  const app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
}

export { messaging };

