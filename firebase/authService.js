// ============================================================
//  firebase/authService.js
//  🔐  Authentication Service — Login / Register / Logout
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * สมัครสมาชิกใหม่
 * @param {string} email
 * @param {string} password
 * @param {object} profileData - { name, studentId, role }
 */
export const registerUser = async (email, password, profileData) => {
  try {
    // 1. สร้าง user ใน Firebase Auth
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    // 2. อัปเดต displayName
    await updateProfile(user, { displayName: profileData.name });

    // 3. บันทึก user profile ลง Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid:       user.uid,
      name:      profileData.name,
      email:     email,
      studentId: profileData.studentId || '',
      role:      profileData.role || 'student',
      createdAt: serverTimestamp(),
    });

    return { ok: true, user };
  } catch (error) {
    return { ok: false, error: translateAuthError(error.code) };
  }
};

/**
 * เข้าสู่ระบบ
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, user: credential.user };
  } catch (error) {
    return { ok: false, error: translateAuthError(error.code) };
  }
};

/**
 * ออกจากระบบ
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/**
 * ดึงข้อมูล user profile จาก Firestore
 * @param {string} uid
 */
export const getUserProfile = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) return { ok: true, data: snap.data() };
    return { ok: false, error: 'ไม่พบข้อมูลผู้ใช้' };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/**
 * ติดตาม auth state (user เข้า/ออก)
 * @param {function} callback
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

const translateAuthError = (code) => {
  const map = {
    'auth/email-already-in-use':   'อีเมลนี้ถูกใช้งานแล้ว',
    'auth/invalid-email':          'รูปแบบอีเมลไม่ถูกต้อง',
    'auth/weak-password':          'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    'auth/user-not-found':         'ไม่พบบัญชีผู้ใช้นี้',
    'auth/wrong-password':         'รหัสผ่านไม่ถูกต้อง',
    'auth/invalid-credential':     'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    'auth/too-many-requests':      'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่',
    'auth/network-request-failed': 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต',
  };
  return map[code] || `เกิดข้อผิดพลาด (${code})`;
};
