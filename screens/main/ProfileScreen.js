// ============================================================
//  screens/main/ProfileScreen.js
// ============================================================
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Card, Chip, colors } from '../../components/UI';

export default function ProfileScreen() {
  const { profile, user, homeworks, schedules, logout } = useApp();
  const pending = homeworks.filter(h => h.status === 'pending').length;
  const done    = homeworks.filter(h => h.status === 'done').length;
  const totalSc = schedules.length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      {/* Profile card */}
      <Card style={{ alignItems: 'center', padding: 28, marginBottom: 16 }}>
        <View style={ps.avatar}>
          <Text style={ps.avatarText}>{profile?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={ps.name}>{profile?.name || user?.displayName || 'ผู้ใช้'}</Text>
        <Text style={ps.email}>{profile?.email || user?.email}</Text>
        {profile?.studentId && <Text style={ps.studentId}>รหัส: {profile.studentId}</Text>}
        <View style={{ marginTop: 10 }}>
          <Chip label={profile?.role === 'admin' ? '👑 Admin' : '🎓 นักศึกษา'}
            color={profile?.role === 'admin' ? colors.purple : colors.primary} />
        </View>
      </Card>

      {/* Stats */}
      <View style={ps.statsRow}>
        {[
          { n: totalSc, l: 'วิชาในตาราง', i: '📅', c: colors.primary, bg: '#dbeafe' },
          { n: pending,  l: 'งานค้างส่ง',  i: '📝', c: colors.warning, bg: '#fef3c7' },
          { n: done,     l: 'ส่งแล้ว',     i: '✅', c: colors.success, bg: '#dcfce7' },
        ].map(s => (
          <View key={s.l} style={[ps.statCard, { backgroundColor: s.bg }]}>
            <Text style={{ fontSize: 22 }}>{s.i}</Text>
            <Text style={[ps.statNum, { color: s.c }]}>{s.n}</Text>
            <Text style={[ps.statLabel, { color: s.c }]}>{s.l}</Text>
          </View>
        ))}
      </View>

      {/* Account info */}
      <Text style={ps.sectionTitle}>ข้อมูลบัญชี</Text>
      <Card style={{ marginBottom: 16 }}>
        {[
          ['👤 ชื่อ',          profile?.name || '-'],
          ['📧 อีเมล',         profile?.email || user?.email || '-'],
          ['🎓 รหัสนักศึกษา',  profile?.studentId || '-'],
          ['🔑 สิทธิ์',        profile?.role === 'admin' ? 'Admin' : 'นักศึกษา'],
        ].map(([label, value]) => (
          <View key={label} style={ps.infoRow}>
            <Text style={ps.infoLabel}>{label}</Text>
            <Text style={ps.infoValue}>{value}</Text>
          </View>
        ))}
      </Card>

      <TouchableOpacity onPress={logout} style={ps.logoutBtn}>
        <Text style={ps.logoutTxt}>🚪 ออกจากระบบ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const ps = StyleSheet.create({
  avatar:    { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:{ fontSize: 32, fontWeight: '800', color: 'white' },
  name:      { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 4 },
  email:     { fontSize: 13, color: colors.muted, marginBottom: 2 },
  studentId: { fontSize: 12, color: colors.subtle },
  statsRow:  { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard:  { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  statNum:   { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  sectionTitle:{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 10 },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  infoValue: { fontSize: 13, color: colors.text, fontWeight: '700' },
  logoutBtn: { marginTop: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 14, padding: 16, alignItems: 'center' },
  logoutTxt: { color: colors.danger, fontWeight: '700', fontSize: 15 },
});
