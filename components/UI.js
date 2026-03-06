// ============================================================
//  components/UI.js
// ============================================================

import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';

export const colors = {
  primary: '#2563eb', success: '#16a34a', danger: '#dc2626',
  warning: '#d97706', purple: '#7c3aed', bg: '#f8fafc',
  card: '#ffffff', border: '#e2e8f0', text: '#1e293b',
  muted: '#64748b', subtle: '#94a3b8',
};

// ── Button ────────────────────────────────────────────────────
export function Btn({ label, onPress, variant = 'primary', size = 'md', disabled, loading, icon, style }) {
  const bg = { primary: colors.primary, success: colors.success, danger: colors.danger, ghost: '#f1f5f9', outline: 'transparent', purple: colors.purple }[variant] || colors.primary;
  const textColor = ['ghost', 'outline'].includes(variant) ? colors.muted : '#ffffff';
  const pad = size === 'lg' ? 14 : size === 'sm' ? 7 : 11;
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading}
      style={[{ backgroundColor: bg, paddingVertical: pad, paddingHorizontal: pad * 2, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: disabled || loading ? 0.6 : 1, borderWidth: variant === 'outline' ? 1.5 : 0, borderColor: variant === 'outline' ? colors.primary : 'transparent' }, style]}>
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : <>{icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}<Text style={{ color: textColor, fontWeight: '700', fontSize: size === 'lg' ? 16 : size === 'sm' ? 12 : 14 }}>{label}</Text></>}
    </TouchableOpacity>
  );
}

// ── Input ────────────────
export function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, required, multiline, numberOfLines, style }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label && (
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted, marginBottom: 6 }}>
          {label}{required && <Text style={{ color: colors.danger }}> *</Text>}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subtle}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        numberOfLines={multiline ? (numberOfLines || 3) : 1}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        // ── Thai fix ──────────────────────────────────────────
        autoCorrect={false}           // ปิด autocorrect ที่ทำให้ตัวอักษรไทยหาย
        autoCapitalize="none"         // ปิด auto capitalize
        spellCheck={false}            // ปิด spell check
        textContentType="none"        // ปิด iOS content type detection
        importantForAutofill="no"     // ปิด Android autofill ที่แทรกแซง input
        // ─────────────────────────────────────────────────────
        style={[{
          borderWidth: 1.5,
          borderColor: focused ? colors.primary : colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'android' ? 10 : 12,
          fontSize: 16,
          color: colors.text,
          backgroundColor: colors.card,
          textAlignVertical: multiline ? 'top' : 'center',
          minHeight: multiline ? 90 : 50,
          includeFontPadding: false,
        }, style]}
      />
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, style, onPress }) {
  const inner = (
    <View style={[{ backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }, style]}>
      {children}
    </View>
  );
  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.8}>{inner}</TouchableOpacity> : inner;
}

// ── Chip ─────────────────────────────────────────────────────
export function Chip({ label, color = colors.primary, small }) {
  return (
    <View style={{ backgroundColor: color + '20', paddingHorizontal: small ? 6 : 10, paddingVertical: small ? 2 : 4, borderRadius: 999 }}>
      <Text style={{ color, fontSize: small ? 10 : 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

// ── Status Badge ─────────────────────────────────────────────
export function StatusBadge({ dueDate, status }) {
  if (status === 'done') return <Chip label="✓ ส่งแล้ว" color={colors.success} />;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const d = new Date(dueDate); d.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - t) / 86400000);
  if (diff < 0)   return <Chip label={`❗ เกิน ${Math.abs(diff)} วัน`} color={colors.danger} />;
  if (diff === 0) return <Chip label="⏰ วันนี้!" color={colors.danger} />;
  if (diff === 1) return <Chip label="⚠️ พรุ่งนี้" color={colors.warning} />;
  if (diff <= 3)  return <Chip label={`อีก ${diff} วัน`} color={colors.warning} />;
  return <Chip label={`อีก ${diff} วัน`} color={colors.muted} />;
}

// ── Section Header ────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{title}</Text>
      {action && <TouchableOpacity onPress={onAction}><Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>{action} →</Text></TouchableOpacity>}
    </View>
  );
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 }}>
      <Text style={{ fontSize: 48, marginBottom: 12 }}>{icon}</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6, textAlign: 'center' }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20 }}>{subtitle}</Text>}
    </View>
  );
}

// ── Loading Screen ─────────────────────────────────────────────
export function LoadingScreen({ message = 'กำลังโหลด...' }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, gap: 14 }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.muted, fontSize: 15 }}>{message}</Text>
    </View>
  );
}

// ── Confirm Alert ─────────────────────────────────────────────
export const confirmAlert = (title, message, onConfirm) => {
  Alert.alert(title, message, [
    { text: 'ยกเลิก', style: 'cancel' },
    { text: 'ยืนยัน', style: 'destructive', onPress: onConfirm },
  ]);
};

// ── Toast ──────────────────────────────────────────────────────
export function Toast({ toast }) {
  if (!toast) return null;
  const bg = { success: colors.success, error: colors.danger, info: colors.primary, warning: colors.warning }[toast.type] || colors.success;
  return (
    <View style={{ position: 'absolute', bottom: 90, left: 20, right: 20, zIndex: 999, backgroundColor: bg, padding: 14, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 }}>
      <Text style={{ color: 'white', fontWeight: '700', fontSize: 14, textAlign: 'center' }}>{toast.msg}</Text>
    </View>
  );
}
