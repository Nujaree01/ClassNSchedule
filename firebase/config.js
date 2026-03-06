// ============================================================
//  firebase/config.js
//  ⚙️  ตั้งค่า Firebase สำหรับแอปพลิเคชัน
//
//  วิธีเชื่อมต่อ Firebase จริง:
//  1. ไปที่ https://console.firebase.google.com
//  2. สร้างโปรเจกต์ใหม่ หรือเลือกโปรเจกต์ที่มีอยู่
//  3. ไปที่ Project Settings > General > Your apps
//  4. คลิก </> (Web app) แล้ว Register app
//  5. คัดลอก firebaseConfig ที่ได้มาวางแทนด้านล่าง
//  6. ใน Firebase Console เปิดใช้งาน:
//     - Authentication > Sign-in method > Email/Password
//     - Firestore Database > Create database
//     - Cloud Messaging (สำหรับ Push Notifications)
// ============================================================

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBE_wAPa_xiFvRlZhRWyVvmgkFvB6Vu18",
  authDomain: "appclass-6a53c.firebaseapp.com",
  projectId: "appclass-6a53c",
  storageBucket: "appclass-6a53c.firebasestorage.app",
  messagingSenderId: "622464245957",
  appId: "1:622464245957:web:7adb825a55adf49256d0ac",
  measurementId: "G-Q47WYRGQCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth with AsyncStorage persistence (stays logged in after app restart)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore Database
export const db = getFirestore(app);

export default app;
