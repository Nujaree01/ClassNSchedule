// ============================================================
//  screens/main/HomeworkScreen.js
// ============================================================

import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  StyleSheet, ScrollView, TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { addHomework, updateHomework, deleteHomework, toggleHomeworkStatus } from '../../firebase/homeworkService';
import { Input, Btn, Chip, StatusBadge, colors, confirmAlert, EmptyState } from '../../components/UI';

const thaiInputProps = {
  autoCorrect: false,
  autoCapitalize: 'none',
  spellCheck: false,
  textContentType: 'none',
  importantForAutofill: 'no',
};

// ── Homework Form Modal ────────────────────────────────────────
function HomeworkFormModal({ visible, onClose, initial, userId, subjects, showToast }) {
  const isEdit = !!initial;
  const [subjectId, setSubjectId] = useState(initial?.subjectId || '');
  const [title, setTitle]         = useState(initial?.title || '');
  const [desc, setDesc]           = useState(initial?.description || '');
  const [dueDate, setDueDate]     = useState(initial?.dueDate || '');
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState('');

  React.useEffect(() => {
    if (visible) {
      setSubjectId(initial?.subjectId || '');
      setTitle(initial?.title || '');
      setDesc(initial?.description || '');
      setDueDate(initial?.dueDate || '');
      setErr('');
    }
  }, [visible, initial]);

  const handleSave = async () => {
    if (!subjectId) { setErr('กรุณาเลือกรายวิชา'); return; }
    if (!title.trim()) { setErr('กรุณากรอกชื่องาน'); return; }
    if (!dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) { setErr('กรุณากรอกวันที่รูปแบบ YYYY-MM-DD เช่น 2025-12-31'); return; }
    setLoading(true); setErr('');
    const data = { subjectId, title: title.trim(), description: desc.trim(), dueDate };
    const res  = isEdit ? await updateHomework(initial.id, data) : await addHomework(userId, data);
    setLoading(false);
    if (res.ok) { showToast(isEdit ? 'แก้ไขสำเร็จ!' : 'เพิ่มการบ้านสำเร็จ!'); onClose(); }
    else setErr(res.error);
  };

  const handleDelete = () => {
    confirmAlert('ลบการบ้าน', `ต้องการลบ "${initial?.title}"?`, async () => {
      await deleteHomework(initial.id);
      showToast('ลบแล้ว', 'info');
      onClose();
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={hms.overlay}>
          <View style={hms.sheet}>
            <View style={hms.handle} />
            <Text style={hms.title}>{isEdit ? '✏️ แก้ไขการบ้าน' : '+ เพิ่มการบ้าน'}</Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Subject selector */}
              <Text style={hms.label}>รายวิชา <Text style={{ color: colors.danger }}>*</Text></Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} keyboardShouldPersistTaps="handled">
                {subjects.map(s => (
                  <TouchableOpacity key={s.id} onPress={() => setSubjectId(s.id)}
                    style={[hms.subChip, { borderColor: s.color, backgroundColor: subjectId === s.id ? s.color : 'white' }]}>
                    <Text style={[hms.subChipCode, { color: subjectId === s.id ? 'white' : s.color }]}>{s.code}</Text>
                    <Text style={[hms.subChipName, { color: subjectId === s.id ? 'rgba(255,255,255,0.85)' : colors.muted }]}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={hms.label}>ชื่องาน / หัวข้อ <Text style={{ color: colors.danger }}>*</Text></Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="เช่น ส่งรายงาน SRS Document"
                placeholderTextColor={colors.subtle}
                {...thaiInputProps}
                style={hms.textInput}
              />

              <Text style={hms.label}>รายละเอียด</Text>
              <TextInput
                value={desc}
                onChangeText={setDesc}
                placeholder="อธิบายรายละเอียดงาน..."
                placeholderTextColor={colors.subtle}
                multiline
                numberOfLines={3}
                {...thaiInputProps}
                style={[hms.textInput, { minHeight: 90, textAlignVertical: 'top' }]}
              />

              <Text style={hms.label}>กำหนดส่ง <Text style={{ color: colors.danger }}>*</Text></Text>
              <TextInput
                value={dueDate}
                onChangeText={(text) => {
                  // ใส่ - อัตโนมัติ เช่น 2025 → 2025-12 → 2025-12-31
                  const cleaned = text.replace(/[^0-9]/g, '');
                  let formatted = cleaned;
                  if (cleaned.length > 4)  formatted = cleaned.slice(0,4) + '-' + cleaned.slice(4);
                  if (cleaned.length > 6)  formatted = cleaned.slice(0,4) + '-' + cleaned.slice(4,6) + '-' + cleaned.slice(6,8);
                  setDueDate(formatted);
                }}
                placeholder={`เช่น ${today}`}
                placeholderTextColor={colors.subtle}
                keyboardType="numeric"
                maxLength={10}
                style={[hms.textInput, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1 }]}
              />
              <Text style={{ fontSize: 11, color: colors.subtle, marginTop: -10, marginBottom: 14 }}>รูปแบบ: ปี-เดือน-วัน (เช่น 2025-12-31)</Text>

              {err !== '' && (
                <View style={hms.errorBox}>
                  <Text style={{ color: colors.danger, fontSize: 13 }}>⚠️ {err}</Text>
                </View>
              )}

              <Btn label="💾 บันทึกการบ้าน" onPress={handleSave} loading={loading} size="lg" style={{ marginBottom: 10 }} />
              {isEdit && <Btn label="🗑 ลบการบ้านนี้" onPress={handleDelete} variant="danger" style={{ marginBottom: 8 }} />}
              <Btn label="ยกเลิก" onPress={onClose} variant="ghost" />
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Homework Card ──────────────────────────────────────────────
function HwCard({ hw, subjects, onEdit, onToggle }) {
  const sub  = subjects.find(s => s.id === hw.subjectId);
  const t    = new Date(); t.setHours(0,0,0,0);
  const d    = new Date(hw.dueDate); d.setHours(0,0,0,0);
  const isOv = hw.status === 'pending' && d < t;
  const borderColor = hw.status === 'done' ? colors.success : isOv ? colors.danger : (sub?.color || colors.primary);
  return (
    <TouchableOpacity onPress={() => onEdit(hw)} activeOpacity={0.8}>
      <View style={[hws.card, { borderLeftColor: borderColor, opacity: hw.status === 'done' ? 0.72 : 1 }]}>
        <TouchableOpacity onPress={() => onToggle(hw.id, hw.status)}
          style={[hws.check, { borderColor: hw.status === 'done' ? colors.success : '#cbd5e1', backgroundColor: hw.status === 'done' ? colors.success : 'white' }]}>
          {hw.status === 'done' && <Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>✓</Text>}
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[hws.hwTitle, { textDecorationLine: hw.status === 'done' ? 'line-through' : 'none', color: hw.status === 'done' ? colors.subtle : colors.text }]}>
            {hw.title}
          </Text>
          {hw.description !== '' && <Text style={hws.hwDesc} numberOfLines={2}>{hw.description}</Text>}
          <View style={hws.hwMeta}>
            <Chip label={sub?.code || '?'} color={sub?.color || colors.primary} small />
            <StatusBadge dueDate={hw.dueDate} status={hw.status} />
            <Text style={hws.hwDate}>📅 {hw.dueDate}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 18, color: colors.subtle }}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Homework Screen ────────────────────────────────────────────
export default function HomeworkScreen() {
  const { user, subjects, homeworks, showToast } = useApp();
  const [filter, setFilter]     = useState('all');
  const [subFilter, setSubFilter] = useState('all');
  const [search, setSearch]     = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const openAdd    = () => { setEditItem(null); setModalVisible(true); };
  const openEdit   = (hw) => { setEditItem(hw); setModalVisible(true); };
  const closeModal = () => { setModalVisible(false); setEditItem(null); };

  const handleToggle = async (id, status) => {
    await toggleHomeworkStatus(id, status);
    showToast(status === 'done' ? 'เปลี่ยนเป็นยังไม่ส่ง' : 'ทำเครื่องหมายส่งแล้ว ✅');
  };

  const filtered = useMemo(() => {
    let list = homeworks;
    if (filter === 'pending') list = list.filter(h => h.status === 'pending');
    if (filter === 'done')    list = list.filter(h => h.status === 'done');
    if (subFilter !== 'all')  list = list.filter(h => h.subjectId === subFilter);
    if (search)               list = list.filter(h => h.title.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [homeworks, filter, subFilter, search]);

  const counts = { all: homeworks.length, pending: homeworks.filter(h=>h.status==='pending').length, done: homeworks.filter(h=>h.status==='done').length };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={hws.searchBar}>
        <Text style={{ fontSize: 16, marginRight: 6 }}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="ค้นหาการบ้าน..."
          placeholderTextColor={colors.subtle}
          {...thaiInputProps}
          style={{ flex: 1, fontSize: 15, color: colors.text }}
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: colors.subtle, fontSize: 20, lineHeight: 22 }}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View style={hws.filterRow}>
        {[['all','ทั้งหมด'],['pending','ค้างส่ง'],['done','ส่งแล้ว']].map(([k,l]) => (
          <TouchableOpacity key={k} onPress={() => setFilter(k)}
            style={[hws.filterTab, { backgroundColor: filter===k ? colors.primary : '#f1f5f9' }]}>
            <Text style={[hws.filterTabTxt, { color: filter===k ? 'white' : colors.muted }]}>{l} ({counts[k]})</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subject filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={hws.subFilterBar} contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}>
        <TouchableOpacity onPress={() => setSubFilter('all')}
          style={[hws.subPill, { backgroundColor: subFilter==='all' ? colors.primary : '#f1f5f9' }]}>
          <Text style={[hws.subPillTxt, { color: subFilter==='all' ? 'white' : colors.muted }]}>📚 ทุกวิชา</Text>
        </TouchableOpacity>
        {subjects.map(s => (
          <TouchableOpacity key={s.id} onPress={() => setSubFilter(s.id)}
            style={[hws.subPill, { backgroundColor: subFilter===s.id ? s.color : '#f1f5f9' }]}>
            <Text style={[hws.subPillTxt, { color: subFilter===s.id ? 'white' : colors.muted }]}>{s.code}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<EmptyState icon="🎉" title="ไม่พบรายการ" subtitle="กดปุ่ม + เพื่อเพิ่มการบ้านใหม่" />}
        renderItem={({ item }) => (
          <HwCard hw={item} subjects={subjects} onEdit={openEdit} onToggle={handleToggle} />
        )}
      />

      {/* FAB */}
      <TouchableOpacity onPress={openAdd} style={hws.fab}>
        <Text style={{ fontSize: 28, color: 'white', lineHeight: 32 }}>+</Text>
      </TouchableOpacity>

      <HomeworkFormModal
        visible={modalVisible}
        onClose={closeModal}
        initial={editItem}
        userId={user?.uid}
        subjects={subjects}
        showToast={showToast}
      />
    </View>
  );
}

const hms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 16, maxHeight: '92%' },
  handle:  { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title:   { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 18 },
  label:   { fontSize: 12, fontWeight: '600', color: colors.muted, marginBottom: 8 },
  subChip: { borderWidth: 1.5, borderRadius: 12, padding: 10, marginRight: 8, minWidth: 110, alignItems: 'center' },
  subChipCode: { fontSize: 13, fontWeight: '800' },
  subChipName: { fontSize: 10, marginTop: 2 },
  // ── Thai-safe TextInput style ──
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'android' ? 10 : 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: 'white',
    marginBottom: 14,
    includeFontPadding: false,
  },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 14 },
});

const hws = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', margin: 16, marginBottom: 10, paddingHorizontal: 14, paddingVertical: Platform.OS === 'android' ? 8 : 11, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filterTab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  filterTabTxt: { fontSize: 13, fontWeight: '700' },
  subFilterBar: { marginBottom: 4, paddingVertical: 4 },
  subPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  subPillTxt: { fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start', borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  hwTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  hwDesc:  { fontSize: 12, color: colors.muted, marginBottom: 6, lineHeight: 18 },
  hwMeta:  { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  hwDate:  { fontSize: 11, color: colors.subtle },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
});
