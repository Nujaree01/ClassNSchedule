// ============================================================
//  screens/admin/UsersScreen.js
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  StyleSheet, ScrollView, TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useApp } from '../../context/AppContext';
import { Btn, colors, confirmAlert, EmptyState } from '../../components/UI';

const thaiInput = {
  autoCorrect: false, autoCapitalize: 'none',
  spellCheck: false, textContentType: 'none',
  importantForAutofill: 'no',
};

// ── User Edit Modal ────────────────────────────────────────────
function UserEditModal({ visible, onClose, user: u, showToast }) {
  const [name,      setName]      = useState('');
  const [role,      setRole]      = useState('student');
  const [studentId, setStudentId] = useState('');
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (visible && u) {
      setName(u.name || '');
      setRole(u.role || 'student');
      setStudentId(u.studentId || '');
    }
  }, [visible, u]);

  const handleSave = async () => {
    if (!name.trim()) { showToast('กรุณากรอกชื่อ', 'error'); return; }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', u.uid), {
        name: name.trim(), role, studentId: studentId.trim(),
      });
      showToast('แก้ไขผู้ใช้สำเร็จ!');
      onClose();
    } catch (e) { showToast('แก้ไขไม่สำเร็จ: ' + e.message, 'error'); }
    setLoading(false);
  };

  const handleDelete = () => {
    confirmAlert('ลบผู้ใช้', `ต้องการลบบัญชี "${u?.name}" ?\n\n⚠️ ไม่สามารถย้อนกลับได้`, async () => {
      try {
        await deleteDoc(doc(db, 'users', u.uid));
        showToast('ลบผู้ใช้แล้ว', 'info'); onClose();
      } catch (e) { showToast('ลบไม่สำเร็จ: ' + e.message, 'error'); }
    });
  };

  if (!u) return null;
  const avatarColor = u.role === 'admin' ? colors.purple : colors.primary;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={um.overlay}>
          <View style={um.sheet}>
            <View style={um.handle} />
            <Text style={um.title}>✏️ แก้ไขผู้ใช้</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={[um.avatar, { backgroundColor: avatarColor }]}>
                  <Text style={{ fontSize: 28, color: 'white', fontWeight: '800' }}>
                    {(u.name || u.email || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{u.email}</Text>
              </View>

              <Text style={um.label}>ชื่อ-นามสกุล <Text style={{ color: colors.danger }}>*</Text></Text>
              <TextInput value={name} onChangeText={setName} placeholder="เช่น นางสาวนุจรี รอดอินทร์"
                placeholderTextColor={colors.subtle} {...thaiInput} style={um.input} />

              <Text style={um.label}>รหัสนักศึกษา</Text>
              <TextInput value={studentId} onChangeText={setStudentId} placeholder="เช่น 66122250057"
                placeholderTextColor={colors.subtle} keyboardType="numeric" style={um.input} />

              <Text style={um.label}>สิทธิ์การใช้งาน</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                {[['student','🎓 นักศึกษา', colors.primary],['admin','👑 Admin', colors.purple]].map(([k,l,c]) => (
                  <TouchableOpacity key={k} onPress={() => setRole(k)}
                    style={[um.roleBtn, { flex: 1, borderColor: c, backgroundColor: role === k ? c : 'white' }]}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: role === k ? 'white' : c, textAlign: 'center' }}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Btn label="💾 บันทึก" onPress={handleSave} loading={loading} size="lg" style={{ marginBottom: 10 }} />
              <Btn label="🗑 ลบผู้ใช้นี้" onPress={handleDelete} variant="danger" style={{ marginBottom: 8 }} />
              <Btn label="ยกเลิก" onPress={onClose} variant="ghost" />
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── UsersScreen ────────────────────────────────────────────────
export default function UsersScreen() {
  const { showToast } = useApp();
  const [users,    setUsers]    = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [modal,    setModal]    = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const data = snap.docs.map(d => ({ uid: d.id, ...d.data() }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setUsers(data);
    }, err => console.error('users:', err.message));
    return unsub;
  }, []);

  const admins   = users.filter(u => u.role === 'admin');
  const students = users.filter(u => u.role !== 'admin');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={us.header}>
        {[
          [users.length,    'ทั้งหมด',   colors.primary, '#dbeafe'],
          [admins.length,   'Admin',      colors.purple,  '#f3f0ff'],
          [students.length, 'นักศึกษา',  colors.success, '#dcfce7'],
        ].map(([n,l,c,bg]) => (
          <View key={l} style={[us.statBox, { backgroundColor: bg }]}>
            <Text style={[us.statNum, { color: c }]}>{n}</Text>
            <Text style={[us.statLabel, { color: c }]}>{l}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={users}
        keyExtractor={i => i.uid}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
        ListEmptyComponent={<EmptyState icon="👥" title="ยังไม่มีผู้ใช้" subtitle="ผู้ใช้จะปรากฏเมื่อสมัครสมาชิก" />}
        renderItem={({ item: u }) => {
          const isAdmin = u.role === 'admin';
          return (
            <TouchableOpacity onPress={() => { setEditUser(u); setModal(true); }} activeOpacity={0.8}>
              <View style={us.card}>
                <View style={[us.avatar, { backgroundColor: isAdmin ? colors.purple : colors.primary }]}>
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
                    {(u.name || u.email || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={us.userName}>{u.name || '(ไม่มีชื่อ)'}</Text>
                  <Text style={us.userEmail}>{u.email}</Text>
                  {u.studentId ? <Text style={us.userSub}>รหัส: {u.studentId}</Text> : null}
                </View>
                <View style={[us.roleBadge, { backgroundColor: isAdmin ? '#f3f0ff' : '#dbeafe' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: isAdmin ? colors.purple : colors.primary }}>
                    {isAdmin ? '👑 Admin' : '🎓 Student'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <UserEditModal visible={modal} onClose={() => { setModal(false); setEditUser(null); }}
        user={editUser} showToast={showToast} />
    </View>
  );
}

const um = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 16, maxHeight: '90%' },
  handle:  { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title:   { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 16 },
  label:   { fontSize: 12, fontWeight: '600', color: colors.muted, marginBottom: 8 },
  avatar:  { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'android' ? 10 : 13,
    fontSize: 16, color: colors.text, backgroundColor: 'white',
    marginBottom: 14, includeFontPadding: false,
  },
  roleBtn: { borderWidth: 2, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8 },
});

const us = StyleSheet.create({
  header:    { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  statBox:   { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statNum:   { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  card: {
    backgroundColor: 'white', borderRadius: 14, padding: 14,
    flexDirection: 'row', gap: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  avatar:    { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  userName:  { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  userEmail: { fontSize: 12, color: colors.muted },
  userSub:   { fontSize: 11, color: colors.subtle, marginTop: 1 },
  roleBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
});
