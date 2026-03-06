// ============================================================
//  screens/main/ScheduleScreen.js
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  StyleSheet, FlatList, TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { addSchedule, updateSchedule, deleteSchedule } from '../../firebase/scheduleService';
import { addSubject } from '../../firebase/subjectService';
import { Btn, colors, confirmAlert, EmptyState } from '../../components/UI';

const DAYS = [
  { key:'monday',    label:'จันทร์',    short:'จ'   },
  { key:'tuesday',   label:'อังคาร',    short:'อ'   },
  { key:'wednesday', label:'พุธ',       short:'พ'   },
  { key:'thursday',  label:'พฤหัสบดี', short:'พฤ'  },
  { key:'friday',    label:'ศุกร์',     short:'ศ'   },
  { key:'saturday',  label:'เสาร์',    short:'ส'   },
  { key:'sunday',    label:'อาทิตย์',   short:'อา'  },
];
const TIMES = ['07:00','08:00','09:00','10:00','11:00','12:00',
               '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
const DAY_MAP = {0:'sunday',1:'monday',2:'tuesday',3:'wednesday',4:'thursday',5:'friday',6:'saturday'};
const SUBJECT_COLORS = ['#2563eb','#16a34a','#d97706','#7c3aed','#dc2626','#0891b2','#be185d','#065f46'];
const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                     'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const thaiInput = { autoCorrect:false, autoCapitalize:'none', spellCheck:false, textContentType:'none', importantForAutofill:'no' };

// ════════════════════════════════════════════════════════════
//  AddSubjectModal
// ════════════════════════════════════════════════════════════
function AddSubjectModal({ visible, onClose, onCreated, subjectCount }) {
  const [code,    setCode]    = useState('');
  const [name,    setName]    = useState('');
  const [teacher, setTeacher] = useState('');
  const [color,   setColor]   = useState(SUBJECT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');

  React.useEffect(() => {
    if (visible) {
      setCode(''); setName(''); setTeacher('');
      setColor(SUBJECT_COLORS[subjectCount % SUBJECT_COLORS.length]);
      setErr(''); setLoading(false);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!code.trim()) { setErr('กรุณากรอกรหัสวิชา'); return; }
    if (!name.trim()) { setErr('กรุณากรอกชื่อวิชา'); return; }
    setLoading(true); setErr('');
    const res = await addSubject({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      teacher: teacher.trim(),
      color,
    });
    setLoading(false);
    if (res.ok) { onCreated(res.id, code.trim().toUpperCase()); }
    else setErr('เพิ่มวิชาไม่สำเร็จ: ' + res.error);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex:1 }}>
        <View style={as.overlay}>
          <View style={as.sheet}>
            <View style={as.handle} />
            <Text style={as.title}>📚 เพิ่มรายวิชาใหม่</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              <Text style={as.label}>รหัสวิชา <Text style={{ color:colors.danger }}>*</Text></Text>
              <TextInput value={code} onChangeText={t => setCode(t.toUpperCase())}
                placeholder="เช่น CSD3102" placeholderTextColor={colors.subtle}
                {...thaiInput} autoCapitalize="characters" style={as.input} />

              <Text style={as.label}>ชื่อวิชา <Text style={{ color:colors.danger }}>*</Text></Text>
              <TextInput value={name} onChangeText={setName}
                placeholder="เช่น วิศวกรรมซอฟต์แวร์" placeholderTextColor={colors.subtle}
                {...thaiInput} style={as.input} />

              <Text style={as.label}>อาจารย์ผู้สอน</Text>
              <TextInput value={teacher} onChangeText={setTeacher}
                placeholder="เช่น รศ.ดร.นลินี โสพัศสถิตย์" placeholderTextColor={colors.subtle}
                {...thaiInput} style={as.input} />

              <Text style={as.label}>สีประจำวิชา</Text>
              <View style={as.colorRow}>
                {SUBJECT_COLORS.map(c => (
                  <TouchableOpacity key={c} onPress={() => setColor(c)}
                    style={[as.colorCircle, { backgroundColor:c,
                      borderWidth: color===c ? 3 : 0, borderColor:'white',
                      elevation: color===c ? 6 : 0 }]}>
                    {color===c && <Text style={{ color:'white', fontWeight:'800', fontSize:14 }}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Preview */}
              <View style={[as.preview, { borderLeftColor:color }]}>
                <View style={[as.previewDot, { backgroundColor:color }]} />
                <View>
                  <Text style={[as.previewCode, { color }]}>{code || 'XXX0000'}</Text>
                  <Text style={as.previewName}>{name || 'ชื่อวิชา'}</Text>
                  {teacher !== '' && <Text style={as.previewTeacher}>👨‍🏫 {teacher}</Text>}
                </View>
              </View>

              {err !== '' && <View style={as.errorBox}><Text style={{ color:colors.danger, fontSize:13 }}>⚠️ {err}</Text></View>}

              <Btn label="💾 เพิ่มวิชานี้" onPress={handleSave} loading={loading} size="lg" style={{ marginBottom:10 }} />
              <Btn label="ยกเลิก" onPress={onClose} variant="ghost" />
              <View style={{ height:24 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
//  SubjectSearchInput
// ════════════════════════════════════════════════════════════
function SubjectSearchInput({ subjects, selectedId, onSelect, onPressAddNew }) {
  const [query,    setQuery]    = useState('');
  const [focused,  setFocused]  = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const selected = subjects.find(s => s.id === selectedId);
  const filtered = query.trim() === '' ? subjects
    : subjects.filter(s => s.code.toLowerCase().includes(query.toLowerCase()) || s.name.includes(query));

  const handleFocus  = () => { setFocused(true); setShowDrop(true); setQuery(''); };
  const handleBlur   = () => { setTimeout(() => { setFocused(false); setShowDrop(false); }, 200); };
  const handleSelect = s  => { onSelect(s.id); setQuery(''); setShowDrop(false); };

  return (
    <View style={{ marginBottom:14, zIndex:10 }}>
      <Text style={fm.label}>รายวิชา <Text style={{ color:colors.danger }}>*</Text></Text>

      {selected && !focused && (
        <TouchableOpacity onPress={handleFocus} style={[fm.selectedBox, { borderColor:selected.color }]}>
          <View style={[fm.colorDot, { backgroundColor:selected.color }]} />
          <View style={{ flex:1 }}>
            <Text style={[fm.selectedCode, { color:selected.color }]}>{selected.code}</Text>
            <Text style={fm.selectedName}>{selected.name}</Text>
          </View>
          <Text style={{ color:colors.subtle, fontSize:12 }}>แตะเพื่อเปลี่ยน</Text>
        </TouchableOpacity>
      )}

      {/* search input */}
      {(!selected || focused) && (
        <TextInput value={query} onChangeText={t => { setQuery(t); setShowDrop(true); }}
          onFocus={handleFocus} onBlur={handleBlur}
          placeholder="พิมพ์ค้นหารายวิชา..." placeholderTextColor={colors.subtle}
          {...thaiInput} style={[fm.input, focused && { borderColor:colors.primary }]} />
      )}

      {/* dropdown */}
      {showDrop && (
        <View style={fm.dropdown}>
          {filtered.length > 0 && (
            <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              <Text style={fm.dropHeader}>📚 วิชาที่มีในระบบ</Text>
              {filtered.map(s => (
                <TouchableOpacity key={s.id} onPress={() => handleSelect(s)} style={fm.dropItem}>
                  <View style={[fm.colorDot, { backgroundColor:s.color }]} />
                  <View style={{ flex:1 }}>
                    <Text style={{ fontSize:13, fontWeight:'700', color:colors.text }}>{s.code}</Text>
                    <Text style={{ fontSize:11, color:colors.muted }}>{s.name}</Text>
                    {s.teacher && <Text style={{ fontSize:10, color:colors.subtle }}>👨‍🏫 {s.teacher}</Text>}
                  </View>
                  {s.id === selectedId && <Text style={{ color:colors.success }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {filtered.length > 0 && <View style={fm.divider} />}
          <TouchableOpacity onPress={() => { setShowDrop(false); setFocused(false); onPressAddNew(); }} style={fm.addNewBtn}>
            <Text style={fm.addNewIcon}>+</Text>
            <View>
              <Text style={fm.addNewTxt}>เพิ่มรายวิชาใหม่</Text>
              <Text style={{ fontSize:11, color:colors.muted }}>ระบุรหัส ชื่อวิชา และอาจารย์ได้เลย</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {selected && !focused && !showDrop && (
        <TouchableOpacity onPress={onPressAddNew} style={fm.addNewBtnFlat}>
          <Text style={fm.addNewIcon}>+</Text>
          <Text style={fm.addNewTxt}>เพิ่มรายวิชาใหม่</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ════════════════════════════════════════════════════════════
//  ScheduleFormModal  —
// ════════════════════════════════════════════════════════════
function ScheduleFormModal({ visible, onClose, initial, userId, subjects, showToast, onPressAddNew, pendingSubjectId }) {
  const isEdit = !!initial;
  const [subjectId,  setSubjectId]  = useState('');
  const [day,        setDay]        = useState('monday');
  const [startTime,  setStartTime]  = useState('09:00');
  const [endTime,    setEndTime]    = useState('12:00');
  const [room,       setRoom]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [err,        setErr]        = useState('');

  React.useEffect(() => {
    if (visible) {
      setSubjectId(initial?.subjectId || '');
      setDay(initial?.day || 'monday');
      setStartTime(initial?.startTime || '09:00');
      setEndTime(initial?.endTime || '12:00');
      setRoom(initial?.room || '');
      setErr('');
    }
  }, [visible, initial]);

  React.useEffect(() => {
    if (pendingSubjectId) setSubjectId(pendingSubjectId);
  }, [pendingSubjectId]);

  const handleSave = async () => {
    if (!subjectId)           { setErr('กรุณาเลือกหรือเพิ่มรายวิชา'); return; }
    if (startTime >= endTime) { setErr('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม'); return; }
    setLoading(true); setErr('');
    const res = isEdit
      ? await updateSchedule(initial.id, { subjectId, day, startTime, endTime, room })
      : await addSchedule(userId, { subjectId, day, startTime, endTime, room });
    setLoading(false);
    if (res.ok) { showToast(isEdit ? 'แก้ไขสำเร็จ!' : 'เพิ่มตารางเรียนสำเร็จ!'); onClose(); }
    else setErr(res.error);
  };

  const handleDelete = () => {
    confirmAlert('ลบตารางเรียน', 'ต้องการลบรายวิชานี้ออกจากตาราง?', async () => {
      await deleteSchedule(initial.id); showToast('ลบแล้ว', 'info'); onClose();
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex:1 }}>
        <View style={fm.overlay}>
          <View style={fm.sheet}>
            <View style={fm.handleBar} />
            <Text style={fm.title}>{isEdit ? '✏️ แก้ไขตารางเรียน' : '+ เพิ่มตารางเรียน'}</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              <SubjectSearchInput subjects={subjects} selectedId={subjectId}
                onSelect={setSubjectId} onPressAddNew={onPressAddNew} />

              <Text style={fm.label}>วัน <Text style={{ color:colors.danger }}>*</Text></Text>
              <View style={fm.dayRow}>
                {DAYS.map(d => (
                  <TouchableOpacity key={d.key} onPress={() => setDay(d.key)}
                    style={[fm.dayBtn, { backgroundColor: day===d.key ? colors.primary : '#f1f5f9' }]}>
                    <Text style={[fm.dayBtnTxt, { color: day===d.key ? 'white' : colors.muted }]}>{d.short}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection:'row', gap:12 }}>
                {[['เวลาเริ่ม', startTime, setStartTime], ['เวลาสิ้นสุด', endTime, setEndTime]].map(([lbl, val, setter]) => (
                  <View key={lbl} style={{ flex:1 }}>
                    <Text style={fm.label}>{lbl} <Text style={{ color:colors.danger }}>*</Text></Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:14 }}>
                      {TIMES.map(t => (
                        <TouchableOpacity key={t} onPress={() => setter(t)}
                          style={[fm.timeChip, { backgroundColor: val===t ? colors.primary : '#f1f5f9' }]}>
                          <Text style={{ color: val===t ? 'white' : colors.muted, fontSize:12, fontWeight:'700', fontFamily: Platform.OS==='ios' ? 'Courier' : 'monospace' }}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </View>

              <Text style={fm.label}>ห้องเรียน</Text>
              <TextInput value={room} onChangeText={setRoom}
                placeholder="เช่น อาคาร 31 ห้อง 1203" placeholderTextColor={colors.subtle}
                {...thaiInput} style={fm.input} />

              {err !== '' && (
                <View style={{ backgroundColor:'#fef2f2', borderWidth:1, borderColor:'#fecaca', borderRadius:10, padding:12, marginBottom:12 }}>
                  <Text style={{ color:colors.danger, fontSize:13 }}>⚠️ {err}</Text>
                </View>
              )}

              <Btn label="💾 บันทึก" onPress={handleSave} loading={loading} size="lg" style={{ marginBottom:10 }} />
              {isEdit && <Btn label="🗑 ลบตารางเรียนนี้" onPress={handleDelete} variant="danger" style={{ marginBottom:8 }} />}
              <Btn label="ยกเลิก" onPress={onClose} variant="ghost" style={{ marginTop:4 }} />
              <View style={{ height:24 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
//  DailyView
// ════════════════════════════════════════════════════════════
function DailyView({ schedules, subjects, selectedDay, setSelectedDay, onEdit }) {
  const getSub = id => subjects.find(s => s.id === id);
  const daySc  = schedules.filter(s => s.day === selectedDay).sort((a,b) => a.startTime.localeCompare(b.startTime));

  return (
    <View style={{ flex:1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={dv.dayBar} contentContainerStyle={{ gap:8, paddingHorizontal:16 }}>
        {DAYS.map(d => {
          const isToday    = d.key === DAY_MAP[new Date().getDay()];
          const isSelected = d.key === selectedDay;
          return (
            <TouchableOpacity key={d.key} onPress={() => setSelectedDay(d.key)}
              style={[dv.dayPill, { backgroundColor: isSelected ? colors.primary : isToday ? '#dbeafe' : '#f1f5f9' }]}>
              <Text style={[dv.dayPillShort, { color: isSelected ? 'white' : isToday ? colors.primary : colors.muted }]}>{d.short}</Text>
              <Text style={[dv.dayPillFull, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.subtle }]}>วัน{d.label}</Text>
              {isToday && !isSelected && <View style={dv.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList data={daySc} keyExtractor={i => i.id}
        contentContainerStyle={{ padding:16, gap:10, paddingBottom:100 }}
        ListEmptyComponent={<EmptyState icon="📅" title="ไม่มีคลาสเรียนวันนี้" subtitle="กดปุ่ม + เพื่อเพิ่มตารางเรียน" />}
        renderItem={({ item:sc }) => {
          const sub = getSub(sc.subjectId);
          return (
            <TouchableOpacity onPress={() => onEdit(sc)} activeOpacity={0.8}>
              <View style={[dv.scCard, { borderLeftColor:sub?.color || colors.primary }]}>
                <View style={[dv.timeBox, { backgroundColor:(sub?.color || colors.primary)+'18' }]}>
                  <Text style={[dv.timeText, { color:sub?.color || colors.primary }]}>{sc.startTime}</Text>
                  <View style={dv.timeLine} />
                  <Text style={[dv.timeText, { color:sub?.color || colors.primary }]}>{sc.endTime}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={dv.subCode}>{sub?.code || '?'}</Text>
                  <Text style={dv.subName}>{sub?.name || 'ไม่ทราบวิชา'}</Text>
                  {sub?.teacher && <Text style={dv.subMeta}>👨‍🏫 {sub.teacher}</Text>}
                  {sc.room      && <Text style={dv.subMeta}>📍 {sc.room}</Text>}
                </View>
                <Text style={{ fontSize:18, color:colors.subtle }}>›</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

// ════════════════════════════════════════════════════════════
//  WeeklyView
// ════════════════════════════════════════════════════════════
function WeeklyView({ schedules, subjects, onEdit }) {
  const getSub   = id => subjects.find(s => s.id === id);
  const todayKey = DAY_MAP[new Date().getDay()];
  const now      = new Date();
  const monthLabel = `${THAI_MONTHS[now.getMonth()]} ${now.getFullYear() + 543}`;

  const activeDays = useMemo(() => DAYS.filter(d => {
    const isWeekday = ['monday','tuesday','wednesday','thursday','friday'].includes(d.key);
    return isWeekday || schedules.some(s => s.day === d.key);
  }), [schedules]);

  const timeSlots = [8,9,10,11,12,13,14,15,16,17].map(h => ({
    label: `${String(h).padStart(2,'0')}:00`,
    hour: h,
  }));

  const usedSubs = useMemo(() => {
    const ids = [...new Set(schedules.map(s => s.subjectId))];
    return ids.map(id => subjects.find(s => s.id === id)).filter(Boolean);
  }, [schedules, subjects]);

  const CELL_W = 62, CELL_H = 72, TIME_W = 46;

  return (
    <ScrollView style={{ flex:1 }} contentContainerStyle={{ paddingBottom:100 }}>
      <View style={wv.monthRow}>
        <Text style={wv.monthTxt}>{monthLabel}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal:8 }}>
        <View>
          {/* Day headers */}
          <View style={{ flexDirection:'row', marginBottom:2 }}>
            <View style={{ width:TIME_W }} />
            {activeDays.map(d => (
              <View key={d.key} style={[wv.dayHeader, { width:CELL_W, backgroundColor: d.key===todayKey ? colors.primary : '#dbeafe' }]}>
                <Text style={[wv.dayHeaderTxt, { color: d.key===todayKey ? 'white' : colors.primary }]}>{d.short}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row' }}>
            {/* Time labels column */}
            <View style={{ width: TIME_W }}>
              {timeSlots.map(slot => (
                <View key={slot.label} style={[wv.timeCol, { width: TIME_W, height: CELL_H, marginBottom: 2 }]}>
                  <Text style={wv.timeTxt}>{slot.label}</Text>
                </View>
              ))}
            </View>

            {activeDays.map(d => {
              const daySc = schedules.filter(s => s.day === d.key);
              return (
                <View key={d.key} style={{ width: CELL_W, marginLeft: 2 }}>
                  {timeSlots.map((slot, slotIdx) => {
                    const sc = daySc.find(s =>
                      parseInt(s.startTime) === slot.hour
                    );
                    const isCovered = !sc && daySc.some(s =>
                      parseInt(s.startTime) < slot.hour &&
                      parseInt(s.endTime) > slot.hour
                    );
                    if (isCovered) return null;

                    const spanH = sc
                      ? (parseInt(sc.endTime) - parseInt(sc.startTime)) * (CELL_H + 2) - 2
                      : CELL_H;
                    const sub = sc ? getSub(sc.subjectId) : null;
                    const isToday = d.key === todayKey;

                    return (
                      <TouchableOpacity
                        key={slot.label}
                        onPress={() => sc && onEdit(sc)}
                        activeOpacity={sc ? 0.75 : 1}
                        style={[wv.cell, {
                          width: CELL_W,
                          height: spanH,
                          marginBottom: 2,
                          backgroundColor: sc
                            ? (sub?.color || colors.primary)
                            : isToday ? '#f0f5ff' : '#f8fafc',
                          borderColor: isToday && !sc ? '#bfdbfe' : '#e2e8f0',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }]}>
                        {sc && sub && (
                          <>
                            <Text style={wv.cellPrefix} numberOfLines={1}>{sub.code?.replace(/\d/g, '')}</Text>
                            <Text style={wv.cellNumber} numberOfLines={1}>{sub.code?.replace(/\D/g, '')}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      {usedSubs.length > 0 && (
        <View style={wv.legendWrap}>
          {usedSubs.map(s => (
            <View key={s.id} style={[wv.legendChip, { backgroundColor:s.color+'22', borderColor:s.color+'55' }]}>
              <View style={[wv.legendDot, { backgroundColor:s.color }]} />
              <Text style={[wv.legendTxt, { color:s.color }]} numberOfLines={1}>{s.code} {s.name}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}


// ════════════════════════════════════════════════════════════
//  ScheduleScreen
// ════════════════════════════════════════════════════════════
export default function ScheduleScreen() {
  const { user, subjects, schedules, showToast } = useApp();
  const [view,          setView]          = useState('daily');
  const [selectedDay,   setSelectedDay]   = useState(DAY_MAP[new Date().getDay()] || 'monday');
  const [formVisible,   setFormVisible]   = useState(false);
  const [editItem,      setEditItem]      = useState(null);
  const [addSubVisible, setAddSubVisible] = useState(false);
  const [pendingSubId,  setPendingSubId]  = useState(null);

  const openAdd   = () => { setEditItem(null); setPendingSubId(null); setFormVisible(true); };
  const openEdit  = item => { setEditItem(item); setPendingSubId(null); setFormVisible(true); };
  const closeForm = () => { setFormVisible(false); setEditItem(null); };

  const handlePressAddNew = () => {
    setFormVisible(false);
    setTimeout(() => setAddSubVisible(true), 300);
  };

  const handleSubjectCreated = (id, code) => {
    setPendingSubId(id);
    setAddSubVisible(false);
    showToast(`เพิ่มวิชา "${code}" สำเร็จ! ✅`);
    setTimeout(() => setFormVisible(true), 300);
  };

  const handleAddSubClose = () => {
    setAddSubVisible(false);
    setTimeout(() => setFormVisible(true), 300);
  };

  return (
    <View style={{ flex:1, backgroundColor:colors.bg }}>
      {/* Toggle */}
      <View style={sc.toggleWrap}>
        <View style={sc.toggleTrack}>
          {[['daily','รายวัน'],['weekly','รายสัปดาห์']].map(([k,l]) => (
            <TouchableOpacity key={k} onPress={() => setView(k)}
              style={[sc.toggleBtn, view===k && sc.toggleBtnActive]}>
              <Text style={[sc.toggleTxt, { color: view===k ? 'white' : colors.muted }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {view === 'daily'
        ? <DailyView schedules={schedules} subjects={subjects} selectedDay={selectedDay} setSelectedDay={setSelectedDay} onEdit={openEdit} />
        : <WeeklyView schedules={schedules} subjects={subjects} onEdit={openEdit} />
      }

      <TouchableOpacity onPress={openAdd} style={sc.fab}>
        <Text style={{ fontSize:28, color:'white', lineHeight:32 }}>+</Text>
      </TouchableOpacity>

      <ScheduleFormModal
        visible={formVisible} onClose={closeForm}
        initial={editItem} userId={user?.uid}
        subjects={subjects} showToast={showToast}
        onPressAddNew={handlePressAddNew}
        pendingSubjectId={pendingSubId}
      />

      <AddSubjectModal
        visible={addSubVisible}
        onClose={handleAddSubClose}
        subjectCount={subjects.length}
        onCreated={handleSubjectCreated}
      />
    </View>
  );
}

// ════════════════════════ STYLES ═════════════════════════════

const as = StyleSheet.create({
  overlay:     { flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'flex-end' },
  sheet:       { backgroundColor:'white', borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:16, maxHeight:'90%' },
  handle:      { width:40, height:4, backgroundColor:'#e2e8f0', borderRadius:2, alignSelf:'center', marginBottom:16 },
  title:       { fontSize:18, fontWeight:'800', color:colors.text, marginBottom:18 },
  label:       { fontSize:12, fontWeight:'600', color:colors.muted, marginBottom:8 },
  input:       { borderWidth:1.5, borderColor:colors.border, borderRadius:12, paddingHorizontal:14, paddingVertical: Platform.OS==='android' ? 10 : 13, fontSize:16, color:colors.text, backgroundColor:'white', marginBottom:14, includeFontPadding:false },
  colorRow:    { flexDirection:'row', gap:10, marginBottom:16, flexWrap:'wrap' },
  colorCircle: { width:38, height:38, borderRadius:19, alignItems:'center', justifyContent:'center' },
  preview:     { flexDirection:'row', alignItems:'center', gap:12, borderLeftWidth:5, borderRadius:12, padding:14, backgroundColor:'#f8fafc', marginBottom:16 },
  previewDot:  { width:14, height:14, borderRadius:7 },
  previewCode: { fontSize:14, fontWeight:'800', marginBottom:2 },
  previewName: { fontSize:13, color:colors.text, fontWeight:'600' },
  previewTeacher: { fontSize:11, color:colors.muted, marginTop:2 },
  errorBox:    { backgroundColor:'#fef2f2', borderWidth:1, borderColor:'#fecaca', borderRadius:10, padding:12, marginBottom:14 },
});

const fm = StyleSheet.create({
  overlay:  { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  sheet:    { backgroundColor:'white', borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:16, maxHeight:'92%' },
  handleBar:{ width:40, height:4, backgroundColor:'#e2e8f0', borderRadius:2, alignSelf:'center', marginBottom:16 },
  title:    { fontSize:18, fontWeight:'800', color:colors.text, marginBottom:18 },
  label:    { fontSize:12, fontWeight:'600', color:colors.muted, marginBottom:8 },
  input:    { borderWidth:1.5, borderColor:colors.border, borderRadius:12, paddingHorizontal:14, paddingVertical: Platform.OS==='android' ? 10 : 13, fontSize:15, color:colors.text, backgroundColor:'white', includeFontPadding:false },
  selectedBox:  { borderWidth:1.5, borderRadius:12, padding:12, flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'white' },
  colorDot:     { width:12, height:12, borderRadius:6, flexShrink:0 },
  selectedCode: { fontSize:13, fontWeight:'800' },
  selectedName: { fontSize:11, color:colors.muted, marginTop:1 },
  dropdown:  { position:'absolute', top:72, left:0, right:0, zIndex:100, backgroundColor:'white', borderRadius:14, borderWidth:1, borderColor:colors.border, shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.12, shadowRadius:16, elevation:8 },
  dropHeader:{ fontSize:11, fontWeight:'700', color:colors.subtle, paddingHorizontal:14, paddingTop:10, paddingBottom:4 },
  dropItem:  { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:10, paddingHorizontal:14 },
  divider:   { height:1, backgroundColor:colors.border, marginHorizontal:14 },
  addNewBtn:     { flexDirection:'row', alignItems:'center', gap:12, padding:14, backgroundColor:'#f0fdf4' },
  addNewBtnFlat: { flexDirection:'row', alignItems:'center', gap:10, marginTop:8, paddingVertical:10, paddingHorizontal:14, backgroundColor:'#f0fdf4', borderRadius:12, borderWidth:1, borderColor:'#bbf7d0' },
  addNewIcon:{ fontSize:22, fontWeight:'800', color:colors.success, width:28, textAlign:'center' },
  addNewTxt: { fontSize:14, fontWeight:'700', color:colors.success },
  dayRow:    { flexDirection:'row', gap:6, marginBottom:16, flexWrap:'wrap' },
  dayBtn:    { paddingVertical:8, paddingHorizontal:13, borderRadius:10 },
  dayBtnTxt: { fontSize:13, fontWeight:'700' },
  timeChip:  { paddingHorizontal:12, paddingVertical:8, borderRadius:8, marginRight:6 },
});

const dv = StyleSheet.create({
  dayBar:       { backgroundColor:'white', paddingVertical:12, borderBottomWidth:1, borderBottomColor:colors.border },
  dayPill:      { paddingVertical:8, paddingHorizontal:14, borderRadius:12, alignItems:'center', minWidth:60 },
  dayPillShort: { fontSize:14, fontWeight:'800' },
  dayPillFull:  { fontSize:9, marginTop:2 },
  todayDot:     { width:5, height:5, backgroundColor:colors.primary, borderRadius:99, marginTop:3 },
  scCard:   { backgroundColor:'white', borderRadius:14, padding:14, flexDirection:'row', gap:12, alignItems:'center', borderLeftWidth:4, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:6, elevation:2 },
  timeBox:  { borderRadius:10, padding:10, alignItems:'center', minWidth:60 },
  timeText: { fontSize:13, fontWeight:'700', fontFamily: Platform.OS==='ios' ? 'Courier' : 'monospace' },
  timeLine: { width:1, height:12, backgroundColor:'rgba(0,0,0,0.15)', marginVertical:4 },
  subCode:  { fontSize:13, fontWeight:'700', color:colors.primary, marginBottom:2 },
  subName:  { fontSize:15, fontWeight:'800', color:colors.text, marginBottom:4 },
  subMeta:  { fontSize:12, color:colors.muted, marginTop:1 },
});

const wv = StyleSheet.create({
  monthRow:    { flexDirection:'row', justifyContent:'center', paddingVertical:12, paddingHorizontal:16 },
  monthTxt:    { fontSize:16, fontWeight:'800', color:colors.text },
  dayHeader:   { alignItems:'center', justifyContent:'center', borderRadius:8, marginHorizontal:2, paddingVertical:8 },
  dayHeaderTxt:{ fontSize:15, fontWeight:'800' },
  timeCol:     { justifyContent:'center', alignItems:'center' },
  timeTxt:     { fontSize:11, fontWeight:'600', color:colors.muted },
  cell:        { marginHorizontal:2, borderRadius:10, alignItems:'center', justifyContent:'center', borderWidth:1 },
  cellPrefix:  { color:'white', fontSize:11, fontWeight:'700', opacity:0.9 },
  cellNumber:  { color:'white', fontSize:13, fontWeight:'800' },
  legendWrap:  { flexDirection:'row', flexWrap:'wrap', gap:8, paddingHorizontal:14, paddingVertical:12 },
  legendChip:  { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:12, paddingVertical:6, borderRadius:20, borderWidth:1 },
  legendDot:   { width:8, height:8, borderRadius:4 },
  legendTxt:   { fontSize:12, fontWeight:'600', maxWidth:140 },
});

const sc = StyleSheet.create({
  toggleWrap:      { paddingHorizontal:16, paddingTop:12, paddingBottom:4, backgroundColor:'white', borderBottomWidth:1, borderBottomColor:colors.border },
  toggleTrack:     { flexDirection:'row', backgroundColor:'#f1f5f9', borderRadius:14, padding:4 },
  toggleBtn:       { flex:1, paddingVertical:9, borderRadius:11, alignItems:'center' },
  toggleBtnActive: { backgroundColor:colors.primary },
  toggleTxt:       { fontSize:14, fontWeight:'700' },
  fab: { position:'absolute', bottom:24, right:24, width:56, height:56, borderRadius:18, backgroundColor:colors.primary, alignItems:'center', justifyContent:'center', shadowColor:colors.primary, shadowOffset:{width:0,height:8}, shadowOpacity:0.4, shadowRadius:16, elevation:10 },
});
