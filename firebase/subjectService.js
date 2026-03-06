// ============================================================
//  firebase/subjectService.js
// ============================================================

import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, onSnapshot, query, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from './config';

const COL = 'subjects';

const DEFAULT_SUBJECTS = [
  { code: 'CSD3102', name: 'วิศวกรรมซอฟต์แวร์',   teacher: 'รศ.ดร.นลินี โสพัศสถิตย์', color: '#2563eb' }
];

/**
 * เพิ่มวิชาเริ่มต้นเข้า Firestore ถ้ายังไม่มี
 * เรียกหลัง login สำเร็จแล้ว
 */
export const seedDefaultSubjectsIfEmpty = async () => {
  try {
    const snap = await getDocs(collection(db, COL));
    if (!snap.empty) return;
    const batch = writeBatch(db);
    DEFAULT_SUBJECTS.forEach(s => {
      batch.set(doc(collection(db, COL)), { ...s, createdAt: serverTimestamp() });
    });
    await batch.commit();
    console.log('✅ Seeded 4 default subjects');
  } catch (e) {
    console.error('Seed error:', e.message);
  }
};

export const subscribeSubjects = (onData) => {
  return onSnapshot(collection(db, COL), (snap) => {
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.code.localeCompare(b.code));
    onData(data);
  }, (err) => {
    console.error('subjects listener error:', err.message);
    onData([]);
  });
};

export const addSubject = async (data) => {
  try {
    const COLORS = ['#2563eb','#16a34a','#d97706','#7c3aed','#dc2626','#0891b2'];
    const ref = await addDoc(collection(db, COL), {
      code: data.code, name: data.name, teacher: data.teacher || '',
      color: data.color || COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  } catch (e) { return { ok: false, error: e.message }; }
};

export const deleteSubject = async (id) => {
  try { await deleteDoc(doc(db, COL, id)); return { ok: true }; }
  catch (e) { return { ok: false, error: e.message }; }
};
