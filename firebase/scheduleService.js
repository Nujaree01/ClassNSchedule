// ============================================================
//  firebase/scheduleService.js
// ============================================================

import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const COL = 'schedules';
const DAY_ORDER = { monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6, sunday:7 };

export const subscribeSchedules = (userId, onData) => {
  const q = query(collection(db, COL), where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const dA = DAY_ORDER[a.day] || 9;
        const dB = DAY_ORDER[b.day] || 9;
        return dA !== dB ? dA - dB : a.startTime.localeCompare(b.startTime);
      });
    onData(data);
  }, err => { console.error('schedules error:', err.message); onData([]); });
};

export const addSchedule = async (userId, data) => {
  try {
    const ref = await addDoc(collection(db, COL), {
      userId, subjectId: data.subjectId, day: data.day,
      startTime: data.startTime, endTime: data.endTime,
      room: data.room || '', createdAt: serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  } catch (e) { return { ok: false, error: e.message }; }
};

export const updateSchedule = async (id, data) => {
  try {
    await updateDoc(doc(db, COL, id), {
      subjectId: data.subjectId, day: data.day,
      startTime: data.startTime, endTime: data.endTime,
      room: data.room || '', updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
};

export const deleteSchedule = async (id) => {
  try { await deleteDoc(doc(db, COL, id)); return { ok: true }; }
  catch (e) { return { ok: false, error: e.message }; }
};
