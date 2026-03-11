// ============================================================
//  screens/auth/LoginScreen.js
//  🔐  Login Screen
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { loginUser, registerUser } from '../../firebase/authService';
import { Input, Btn, colors } from '../../components/UI';

export default function LoginScreen() {
  const [mode, setMode]       = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]       = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('กรุณากรอกอีเมลและรหัสผ่าน'); return; }
    setLoading(true); setError('');
    const res = await loginUser(email.trim(), password);
    if (!res.ok) setError(res.error);
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ'); return; }
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัว'); return; }
    setLoading(true); setError('');
    const res = await registerUser(email.trim(), password, { name, studentId, role: 'student' });
    if (!res.ok) setError(res.error);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>📚</Text>
          </View>
          <Text style={styles.appName}>ClassSchedule</Text>
          <Text style={styles.appSub}>Homework Management System</Text>
          <Text style={styles.university}>มหาวิทยาลัยราชภัฏสวนสุนันทา</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tab switcher */}
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tab, mode === 'login' && styles.tabActive]} onPress={() => { setMode('login'); setError(''); }}>
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>เข้าสู่ระบบ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, mode === 'register' && styles.tabActive]} onPress={() => { setMode('register'); setError(''); }}>
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>สมัครสมาชิก</Text>
            </TouchableOpacity>
          </View>

          {/* Register extras */}
          {mode === 'register' && (
            <>
              <Input label="ชื่อ-นามสกุล" value={name} onChangeText={setName} placeholder="" required />
              <Input label="รหัสนักศึกษา" value={studentId} onChangeText={setStudentId} placeholder="" keyboardType="numeric" />
            </>
          )}

          <Input label="อีเมล" value={email} onChangeText={setEmail} placeholder="example@ssru.ac.th" keyboardType="email-address" required />
          <Input label="รหัสผ่าน" value={password} onChangeText={setPassword} placeholder="อย่างน้อย 6 ตัวอักษร" secureTextEntry required />

          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>❌ {error}</Text>
            </View>
          )}

          <Btn
            label={mode === 'login' ? '🔐 เข้าสู่ระบบ' : '📝 สมัครสมาชิก'}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            loading={loading}
            size="lg"
            style={{ marginTop: 4 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1d4ed8',
    padding: 20,
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  logoEmoji:  { fontSize: 36 },
  appName:    { fontSize: 26, fontWeight: '800', color: 'white', marginBottom: 4 },
  appSub:     { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 3 },
  university: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  card: {
    backgroundColor: 'white', borderRadius: 20,
    padding: 24, shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24,
    elevation: 12,
  },
  tabRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.primary },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: colors.danger, fontSize: 13 },
});
