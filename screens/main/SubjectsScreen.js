// ============================================================
//  screens/main/SubjectsScreen.js
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  StyleSheet, ScrollView, TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { addSubject, updateSubject, deleteSubject } from '../../firebase/subjectService';
import { Btn, colors, confirmAlert, EmptyState } from '../../components/UI';

const COLORS = [
  { hex: '#2563eb', name: 'น้ำเงิน' },
  { hex: '#16a34a', name: 'เขียว'  },
  { hex: '#d97706', name: 'เหลือง' },
  { hex: '#7c3aed', name: 'ม่วง'   },
  { hex: '#dc2626', name: 'แดง'    },
  { hex: '#0891b2', name: 'ฟ้า'    },
  { hex: '#be185d', name: 'ชมพู'   },
  { hex: '#065f46', name: 'เขียวเข้ม' },
];

const thaiInput = {
  autoCorrect: false, autoCapitalize: 'none',
  spellCheck: false, textContentType: 'none',
  importantForAutofill: 'no',
};

// ── Subject Form Modal ─────────────────────────────────────────
function SubjectFormModal({ visible, onClose, initial, showToast }) {
  const isEdit = !!initial;

  const [code,    setCode]    = useState(initial?.code    || '');
  const [name,    setName]    = useState(initial?.name    || '');
  const [teacher, setTeacher] = useState(initial?.teacher || '');
  const [color,   setColor]   = useState(initial?.color   || COLORS[0].hex);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');

  React.useEffect(() => {
    if (visible) {
      setCode(initial?.code || '');
      setName(initial?.name || '');
      setTeacher(initial?.teacher || '');
      setColor(initial?.color || COLORS[0].hex);
      setErr('');
    }
  }, [visible, initial]);

  const handleSave = async () => {
    if (!code.trim()) { setErr('กรุณากรอกรหัสวิชา'); return; }
    if (!name.trim()) { setErr('กรุณากรอกชื่อวิชา'); return; }
    setLoading(true); setErr('');
    const data = { code: code.trim().toUpperCase(), name: name.trim(), teacher: teacher.trim(), color };
    const res  = isEdit
      ? await updateSubject(initial.id, data)
      : await addSubject(data);
    setLoading(false);
    if (res.ok) { showToast(isEdit ? 'แก้ไขวิชาสำเร็จ!' : 'เพิ่มวิชาสำเร็จ!'); onClose(); }
    else setErr(res.error || 'เกิดข้อผิดพลาด');
  };

  const handleDelete = () => {
    confirmAlert(
      'ลบรายวิชา',
      `ต้องการลบ "${initial?.code} - ${initial?.name}" ?\n\n⚠️ ตารางเรียนที่ใช้วิชานี้จะแสดงผลผิดปกติ`,
      async () => {
        const res = await deleteSubject(initial.id);
        if (res.ok) { showToast('ลบวิชาแล้ว', 'info'); onClose(); }
        else showToast('ลบไม่สำเร็จ: ' + res.error, 'error');
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={fm.overlay}>
          <View style={fm.sheet}>
            <View style={fm.handle} />
            <Text style={fm.title}>{isEdit ? '✏️ แก้ไขรายวิชา' : '+ เพิ่มรายวิชาใหม่'}</Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* รหัสวิชา */}
              <Text style={fm.label}>รหัสวิชา <Text style={{ color: colors.danger }}>*</Text></Text>
              <TextInput
                value={code}
                onChangeText={t => setCode(t.toUpperCase())}
                placeholder="เช่น CSD3102"
                placeholderTextColor={colors.subtle}
                {...thaiInput}
                autoCapitalize="characters"
                style={fm.input}
              />

              {/* ชื่อวิชา */}
              <Text style={fm.label}>ชื่อวิชา <Text style={{ color: colors.danger }}>*</Text></Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="เช่น วิศวกรรมซอฟต์แวร์"
                placeholderTextColor={colors.subtle}
                {...thaiInput}
                style={fm.input}
              />

              {/* อาจารย์ผู้สอน */}
              <Text style={fm.label}>อาจารย์ผู้สอน</Text>
              <TextInput
                value={teacher}
                onChangeText={setTeacher}
                placeholder="เช่น รศ.ดร.นลินี โสพัศสถิตย์"
                placeholderTextColor={colors.subtle}
                {...thaiInput}
                style={fm.input}
              />

              {/* เลือกสี */}
              <Text style={fm.label}>สีประจำวิชา</Text>
              <View style={fm.colorRow}>
                {COLORS.map(c => (
                  <TouchableOpacity key={c.hex} onPress={() => setColor(c.hex)}
                    style={[fm.colorCircle, { backgroundColor: c.hex, borderWidth: color === c.hex ? 3 : 0, borderColor: 'white', shadowColor: c.hex, shadowOpacity: color === c.hex ? 0.6 : 0, shadowRadius: 6, elevation: color === c.hex ? 6 : 0 }]}>
                    {color === c.hex && <Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Preview */}
              <View style={[fm.preview, { borderLeftColor: color }]}>
                <View style={[fm.previewDot, { backgroundColor: color }]} />
                <View>
                  <Text style={[fm.previewCode, { color }]}>{code || 'XXX0000'}</Text>
                  <Text style={fm.previewName}>{name || 'ชื่อวิชา'}</Text>
                  {teacher !== '' && <Text style={fm.previewTeacher}>👨‍🏫 {teacher}</Text>}
                </View>
              </View>

              {err !== '' && (
                <View style={fm.errorBox}>
                  <Text style={{ color: colors.danger, fontSize: 13 }}>⚠️ {err}</Text>
                </View>
              )}

              <Btn label="💾 บันทึก" onPress={handleSave} loading={loading} size="lg" style={{ marginBottom: 10 }} />
              {isEdit && (
                <Btn label="🗑 ลบรายวิชานี้" onPress={handleDelete} variant="danger" style={{ marginBottom: 8 }} />
              )}
              <Btn label="ยกเลิก" onPress={onClose} variant="ghost" />
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── SubjectsScreen ─────────────────────────────────────────────
export default function SubjectsScreen() {
  const { subjects, schedules, homeworks, showToast } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem,     setEditItem]     = useState(null);

  const openAdd    = () => { setEditItem(null); setModalVisible(true); };
  const openEdit   = (s)  => { setEditItem(s);  setModalVisible(true); };
  const closeModal = () => { setModalVisible(false); setEditItem(null); };

  const countSchedules = id => schedules.filter(s => s.subjectId === id).length;
  const countHomeworks = id => homeworks.filter(h => h.subjectId === id).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header info */}
      <View style={ss.header}>
        <View style={ss.statBox}>
          <Text style={ss.statNum}>{subjects.length}</Text>
          <Text style={ss.statLabel}>วิชาทั้งหมด</Text>
        </View>
      </View>

      {/* Subject list */}
      <FlatList
        data={subjects}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState icon="📚" title="ยังไม่มีรายวิชา"
            subtitle="กดปุ่ม + เพื่อเพิ่มรายวิชาแรก" />
        }
        renderItem={({ item: s }) => (
          <TouchableOpacity onPress={() => openEdit(s)} activeOpacity={0.8}>
            <View style={[ss.card, { borderLeftColor: s.color }]}>
              <View style={[ss.colorTag, { backgroundColor: s.color }]}>
                <Text style={ss.colorTagText}>{s.code}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ss.subName}>{s.name}</Text>
                {s.teacher !== '' && (
                  <Text style={ss.subTeacher}>👨‍🏫 {s.teacher}</Text>
                )}
                <View style={ss.usageRow}>
                  <View style={ss.usageBadge}>
                    <Text style={ss.usageText}>📅 {countSchedules(s.id)} ครั้ง/สัปดาห์</Text>
                  </View>
                  <View style={[ss.usageBadge, { backgroundColor: '#fef3c7' }]}>
                    <Text style={[ss.usageText, { color: colors.warning }]}>📝 {countHomeworks(s.id)} งาน</Text>
                  </View>
                </View>
              </View>

              <Text style={{ fontSize: 18, color: colors.subtle }}>›</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity onPress={openAdd} style={ss.fab}>
        <Text style={{ fontSize: 28, color: 'white', lineHeight: 32 }}>+</Text>
      </TouchableOpacity>

      <SubjectFormModal
        visible={modalVisible}
        onClose={closeModal}
        initial={editItem}
        showToast={showToast}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const fm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 16, maxHeight: '92%' },
  handle:  { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title:   { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 18 },
  label:   { fontSize: 12, fontWeight: '600', color: colors.muted, marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'android' ? 10 : 13,
    fontSize: 16, color: colors.text, backgroundColor: 'white',
    marginBottom: 14, includeFontPadding: false,
  },
  colorRow:    { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  colorCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  preview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderLeftWidth: 5, borderRadius: 12, padding: 14,
    backgroundColor: '#f8fafc', marginBottom: 16,
  },
  previewDot:     { width: 14, height: 14, borderRadius: 7, flexShrink: 0 },
  previewCode:    { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  previewName:    { fontSize: 13, color: colors.text, fontWeight: '600' },
  previewTeacher: { fontSize: 11, color: colors.muted, marginTop: 2 },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 14 },
});

const ss = StyleSheet.create({
  header:    { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  statBox:   { flex: 1, backgroundColor: '#dbeafe', borderRadius: 12, padding: 12, alignItems: 'center' },
  statNum:   { fontSize: 22, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 10, fontWeight: '600', color: colors.primary, marginTop: 2 },
  card: {
    backgroundColor: 'white', borderRadius: 14, padding: 14,
    flexDirection: 'row', gap: 12, alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  colorTag:     { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', minWidth: 70 },
  colorTagText: { color: 'white', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  subName:      { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  subTeacher:   { fontSize: 12, color: colors.muted, marginBottom: 6 },
  usageRow:     { flexDirection: 'row', gap: 6 },
  usageBadge:   { backgroundColor: '#dbeafe', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  usageText:    { fontSize: 11, color: colors.primary, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.purple, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
});
