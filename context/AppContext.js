// ============================================================
//  context/AppContext.js
// ============================================================
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthChange, getUserProfile, logoutUser } from '../firebase/authService';
import { subscribeSchedules }  from '../firebase/scheduleService';
import { subscribeHomeworks }  from '../firebase/homeworkService';
import { subscribeSubjects, seedDefaultSubjectsIfEmpty } from '../firebase/subjectService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [profile,   setProfile]   = useState(null);
  const [subjects,  setSubjects]  = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const unsubRef = useRef({ subjects:null, sc:null, hw:null });

  const clearListeners = () => {
    Object.values(unsubRef.current).forEach(fn => fn?.());
    unsubRef.current = { subjects:null, sc:null, hw:null };
  };

  useEffect(() => {
    const unsubAuth = onAuthChange(async (firebaseUser) => {
      clearListeners();
      if (firebaseUser) {
        setUser(firebaseUser);
        const res = await getUserProfile(firebaseUser.uid);
        if (res.ok) setProfile(res.data);
        await seedDefaultSubjectsIfEmpty();
        unsubRef.current.subjects = subscribeSubjects(setSubjects);
        unsubRef.current.sc       = subscribeSchedules(firebaseUser.uid, setSchedules);
        unsubRef.current.hw       = subscribeHomeworks(firebaseUser.uid, setHomeworks);
      } else {
        setUser(null); setProfile(null);
        setSubjects([]); setSchedules([]); setHomeworks([]);
      }
      setLoading(false);
    });
    return () => { unsubAuth(); clearListeners(); };
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  const logout = async () => { await logoutUser(); };

  // ── notifications enriched ──────
  const notifications = React.useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const now   = new Date();

    const list = homeworks
      .filter(h => h.status === 'pending')
      .flatMap(hw => {
        const due  = new Date(hw.dueDate); due.setHours(0,0,0,0);
        const diff = Math.ceil((due - today) / 86400000);
        const subj = subjects.find(s => s.id === hw.subjectId);

        if (diff < 0)   return [{ id:'o'+hw.id, hwId:hw.id, type:'danger',
          title:'งานเกินกำหนดส่ง!',
          body:`${hw.title} วิชา ${subj?.code || ''} เกินกำหนดแล้ว`,
          dueDate:hw.dueDate, subj, hw, createdAt: now }];

        if (diff <= 1)  return [{ id:'w'+hw.id, hwId:hw.id, type:'warning',
          title:'ใกล้ถึงกำหนดส่งงาน!',
          body:`${hw.title} วิชา ${subj?.code || ''} ต้องส่ง${diff===0?'วันนี้':'พรุ่งนี้'} ${hw.dueDate}`,
          dueDate:hw.dueDate, subj, hw, createdAt: now }];

        if (diff <= 3)  return [{ id:'s'+hw.id, hwId:hw.id, type:'warning',
          title:'ใกล้ถึงกำหนดส่งงาน!',
          body:`${hw.title} วิชา ${subj?.code || ''} ต้องส่ง ${hw.dueDate}`,
          dueDate:hw.dueDate, subj, hw, createdAt: now }];

        return [];
      });

    const dayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][now.getDay()];
    const todaySc = schedules.filter(s => s.day === dayKey);
    const scNotifs = todaySc.map(sc => {
      const subj = subjects.find(s => s.id === sc.subjectId);
      const startH = parseInt(sc.startTime?.split(':')[0] || 0);
      const startM = parseInt(sc.startTime?.split(':')[1] || 0);
      const classTime = new Date(); classTime.setHours(startH, startM, 0, 0);
      const diffMin = Math.round((classTime - now) / 60000);
      if (diffMin > 0 && diffMin <= 60) {
        return { id:'sc'+sc.id, hwId:null, type:'schedule',
          title:'เตือนตารางเรียนวันนี้',
          body:`วิชา ${subj?.code || ''} ห้อง ${sc.room || '-'} เริ่มเรียน ${sc.startTime} น. อีก ${diffMin} นาที`,
          subj, sc, createdAt: now };
      }
      return null;
    }).filter(Boolean);

    return [...scNotifs, ...list];
  }, [homeworks, subjects, schedules]);

  return (
    <AppContext.Provider value={{
      user, profile, subjects, schedules, homeworks,
      notifications, loading, toast, showToast, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
