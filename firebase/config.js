import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDBE_wAPa_xiFvRlZhRWyVvmgkFvB6Vu18",
  authDomain: "appclass-6a53c.firebaseapp.com",
  projectId: "appclass-6a53c",
  storageBucket: "appclass-6a53c.firebasestorage.app",
  messagingSenderId: "622464245957",
  appId: "1:622464245957:web:7adb825a55adf49256d0ac",
  measurementId: "G-Q47WYRGQCN"
};

const app = initializeApp(firebaseConfig);

let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };

export const db = getFirestore(app);

export default app;