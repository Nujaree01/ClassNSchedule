# 📚 ClassSchedule & Homework Management System
### React Native + Firebase — Setup Guide

---

## 🗂 โครงสร้างโปรเจกต์

```
classschedule-app/
├── App.js                          # Entry point + Navigation
├── package.json
├── firestore.rules                 # Security rules สำหรับ Firestore
│
├── firebase/
│   ├── config.js                   # ⚙️  Firebase config (ต้องแก้ไข!)
│   ├── authService.js              # Login / Register / Logout
│   ├── scheduleService.js          # Schedule CRUD + Real-time
│   ├── homeworkService.js          # Homework CRUD + Real-time
│   └── subjectService.js          # Subject CRUD (Admin)
│
├── context/
│   └── AppContext.js               # Global state + Auth listener
│
├── components/
│   └── UI.js                       # Reusable UI components
│
└── screens/
    ├── auth/
    │   └── LoginScreen.js          # Login + Register
    └── main/
        ├── DashboardScreen.js      # หน้าหลัก
        ├── ScheduleScreen.js       # ตารางเรียน (CRUD)
        ├── HomeworkScreen.js       # การบ้าน (CRUD)
        └── ProfileScreen.js        # โปรไฟล์ + แจ้งเตือน
```

---

## 🚀 ขั้นตอนการติดตั้ง

### Step 1 — ตั้งค่า Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com)
2. คลิก **Add project** → ตั้งชื่อโปรเจกต์
3. เปิดใช้งาน Services:
   - **Authentication** → Sign-in method → เปิด **Email/Password**
   - **Firestore Database** → Create database → เลือก **production mode**
   - คัดลอก Firestore Rules จากไฟล์ `firestore.rules` ไปวาง

### Step 2 — ดึง Firebase Config

1. Project Settings → General → Your apps
2. คลิก **</>** (Web) → Register app
3. คัดลอก `firebaseConfig` ที่ได้

### Step 3 — แก้ไขไฟล์ `firebase/config.js`

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",          // ← วางค่าจาก Firebase Console
  authDomain:        "your-app.firebaseapp.com",
  projectId:         "your-app",
  storageBucket:     "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
};
```

### Step 4 — ติดตั้ง Dependencies

```bash
# เปิด Terminal ไปที่โฟลเดอร์โปรเจกต์
cd classschedule-app

# ติดตั้ง packages
npm install

# หรือถ้าใช้ yarn
yarn install
```

### Step 5 — รัน App

```bash
# เริ่ม Expo Dev Server
npx expo start

# กด 'a' เพื่อเปิดบน Android Emulator
# หรือสแกน QR Code ด้วยแอป "Expo Go" บนมือถือจริง
```

---

## 📱 วิธีทดสอบบนมือถือจริง (ไม่ต้อง Build)

1. ติดตั้งแอป **Expo Go** จาก Play Store
2. รัน `npx expo start` ในเครื่อง
3. สแกน QR Code ที่แสดงใน Terminal หรือเบราว์เซอร์

---

## 🔥 Firestore Database Structure

```
Firestore
├── users/{uid}
│   ├── uid: string
│   ├── name: string
│   ├── email: string
│   ├── studentId: string
│   ├── role: "student" | "admin"
│   └── createdAt: timestamp
│
├── subjects/{id}
│   ├── code: string        (e.g. "CSD3102")
│   ├── name: string        (e.g. "วิศวกรรมซอฟต์แวร์")
│   ├── teacher: string
│   ├── color: string       (hex color)
│   └── createdAt: timestamp
│
├── schedules/{id}
│   ├── userId: string      (Firebase Auth UID)
│   ├── subjectId: string   (ref to subjects)
│   ├── day: string         ("monday" | "tuesday" | ...)
│   ├── startTime: string   ("09:00")
│   ├── endTime: string     ("12:00")
│   ├── room: string
│   └── createdAt: timestamp
│
└── homeworks/{id}
    ├── userId: string
    ├── subjectId: string
    ├── title: string
    ├── description: string
    ├── dueDate: string     ("YYYY-MM-DD")
    ├── status: string      ("pending" | "done")
    └── createdAt: timestamp
```

---

## 🌟 Features

| Feature | รายละเอียด |
|---------|-----------|
| 🔐 Auth | Login / Register / Auto-login (AsyncStorage) |
| 📅 Schedule | เพิ่ม แก้ไข ลบ ตารางเรียน + Real-time sync |
| 📝 Homework | เพิ่ม แก้ไข ลบ + Toggle สถานะ + ค้นหา/กรอง |
| 🔔 Notifications | แจ้งเตือนงานใกล้กำหนด (computed จาก Firestore) |
| 🌐 Real-time | Firestore onSnapshot — ข้อมูลอัปเดตทันที |
| 🔒 Security | Firestore Rules — อ่าน/เขียนได้เฉพาะข้อมูลตัวเอง |

---

## 🛠 Tech Stack

- **React Native** + **Expo** v51
- **Firebase** v10 (Auth + Firestore)
- **React Navigation** v6 (Stack + Bottom Tabs)
- **AsyncStorage** (Auth persistence)

---

## 👤 ข้อมูลโปรเจกต์

- **นักศึกษา:** นางสาวนุจรี รอดอินทร์  
- **รหัส:** 66122250057  
- **วิชา:** CSD3102 Software Engineering  
- **ภาคเรียน:** 2/2568  
- **มหาวิทยาลัย:** ราชภัฏสวนสุนันทา
