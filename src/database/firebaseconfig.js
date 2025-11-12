import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import { getDatabase } from "firebase/database"
import Constants from "expo-constants"
import "react-native-get-random-values"
import "react-native-url-polyfill/auto"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"



const { extra } = Constants.expoConfig;

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
  databaseURL: extra.FIREBASE_DATABASE_URL
};


const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

// Inicializar Realtime Database (usando databaseURL si está presente)
const realtimeDB = getDatabase(app, firebaseConfig.databaseURL);

export { app, auth, db, realtimeDB };