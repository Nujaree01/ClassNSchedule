// ============================================================
//  firebase/homeworkService.js
// ============================================================

import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const COL = 'homeworks';

export const subscribeHomeworks = (userId, onData) => {
  const q = query(collection(db, COL), where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    onData(data);
  }, err => { console.error('homeworks error:', err.message); onData([]); });
};

export const addHomework = async (userId, data) => {
  try {
    const ref = await addDoc(collection(db, COL), {
      userId, subjectId: data.subjectId, title: data.title,
      description: data.description || '', dueDate: data.dueDate,
      status: 'pending', createdAt: serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  } catch (e) { return { ok: false, error: e.message }; }
};

export const updateHomework = async (id, data) => {
  try {
    await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
};

export const toggleHomeworkStatus = async (id, currentStatus) => {
  return updateHomework(id, { status: currentStatus === 'done' ? 'pending' : 'done' });
};

export const deleteHomework = async (id) => {
  try { await deleteDoc(doc(db, COL, id)); return { ok: true }; }
  catch (e) { return { ok: false, error: e.message }; }
};
