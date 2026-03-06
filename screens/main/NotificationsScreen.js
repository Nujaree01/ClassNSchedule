// ============================================================
//  screens/main/NotificationsScreen.js
// ============================================================
import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Platform, StatusBar,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../components/UI';

// ── ประเภทการแจ้งเตือน ──────────────────────────────────────
const TYPE_CFG = {
  danger:   { iconBg:'#fee2e2', icon:'❗',  border:'#fecaca' },
  warning:  { iconBg:'#fef3c7', icon:'⚠️',  border:'#fde68a' },
  schedule: { iconBg:'#dbeafe', icon:'📅',  border:'#bfdbfe' },
  done:     { iconBg:'#dcfce7', icon:'✅',  border:'#bbf7d0' },
  info:     { iconBg:'#f3f0ff', icon:'🔔',  border:'#ddd6fe' },
};

// ── จัดกลุ่มตามวัน ───────────────────────────────────────────
function getGroup(n) {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yest  = new Date(today); yest.setDate(today.getDate() - 1);
  const ts    = n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt || Date.now());
  const d     = new Date(ts.getFullYear(), ts.getMonth(), ts.getDate());
  if (d.getTime() >= today.getTime()) return 'วันนี้';
  if (d.getTime() >= yest.getTime())  return 'เมื่อวาน';
  return 'ก่อนหน้า';
}

function fmtTime(n) {
  const ts = n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt || Date.now());
  return ts.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' }) + ' น.';
}

// ── Card แต่ละรายการ ─────────────────────────────────────────
function NotiCard({ item }) {
  const cfg = TYPE_CFG[item.type] || TYPE_CFG.info;
  return (
    <View style={[ns.card, { borderColor: cfg.border }]}>
      <View style={[ns.iconBox, { backgroundColor: cfg.iconBg }]}>
        <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={ns.cardTitle}>{item.title}</Text>
        <Text style={ns.cardBody}>{item.body}</Text>
        <Text style={ns.cardTime}>{fmtTime(item)}</Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function NotificationsScreen({ navigation }) {
  const { notifications } = useApp();

  const grouped = useMemo(() => {
    const g = {};
    ['วันนี้','เมื่อวาน','ก่อนหน้า'].forEach(k => { g[k] = []; });
    notifications.forEach(n => g[getGroup(n)]?.push(n));
    return g;
  }, [notifications]);

  const sections = Object.entries(grouped).filter(([, items]) => items.length > 0);
  const total    = notifications.length;

  return (
    <View style={ns.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header ── */}
      <View style={ns.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
          <Text style={ns.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={ns.headerTitleRow}>
          <Text style={{ fontSize:22 }}>🔔</Text>
          <Text style={ns.headerTitle}>การแจ้งเตือน</Text>
          {total > 0 && (
            <View style={ns.headerBadge}>
              <Text style={ns.headerBadgeTxt}>{total}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── รายการ ── */}
      {total === 0
        ? (
          <View style={ns.emptyWrap}>
            <Text style={{ fontSize: 56, marginBottom: 12 }}>✅</Text>
            <Text style={ns.emptyTitle}>ไม่มีการแจ้งเตือน</Text>
            <Text style={ns.emptyDesc}>ทุกอย่างเรียบร้อยดี 🎉</Text>
          </View>
        )
        : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {sections.map(([group, items]) => (
              <View key={group}>
                {/* หัวกลุ่ม */}
                <Text style={ns.groupLabel}>{group}</Text>
                {items.map(n => <NotiCard key={n.id} item={n} />)}
              </View>
            ))}
          </ScrollView>
        )
      }
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────
const HEADER_PT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

const ns = StyleSheet.create({
  screen: { flex:1, backgroundColor:'#f8fafc' },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: HEADER_PT, paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  backArrow:      { fontSize:30, color:'white', lineHeight:34, marginTop:-2 },
  headerTitleRow: { flex:1, flexDirection:'row', alignItems:'center', gap:8 },
  headerTitle:    { fontSize:20, fontWeight:'800', color:'white' },
  headerBadge:    { backgroundColor:'rgba(255,255,255,0.3)', borderRadius:10, paddingHorizontal:8, paddingVertical:2 },
  headerBadgeTxt: { color:'white', fontWeight:'800', fontSize:12 },
  markAllBtn:     { backgroundColor:'rgba(255,255,255,0.2)', borderRadius:10, paddingHorizontal:12, paddingVertical:7 },
  markAllTxt:     { color:'white', fontSize:12, fontWeight:'700' },

  groupLabel: {
    fontSize:13, fontWeight:'700', color:colors.muted,
    paddingHorizontal:16, paddingTop:20, paddingBottom:8,
  },

  // Card
  card: {
    flexDirection:'row', alignItems:'flex-start', gap:12,
    backgroundColor:'white',
    marginHorizontal:12, marginBottom:8,
    borderRadius:16, padding:14,
    borderWidth:1,
    shadowColor:'#000', shadowOffset:{width:0,height:2},
    shadowOpacity:0.06, shadowRadius:8, elevation:2,
  },
  iconBox:   { width:46, height:46, borderRadius:14, alignItems:'center', justifyContent:'center', flexShrink:0 },
  cardTitle: { fontSize:14, fontWeight:'800', color:colors.text, marginBottom:3 },
  cardBody:  { fontSize:13, color:colors.muted, lineHeight:19, marginBottom:5 },
  cardTime:  { fontSize:11, color:colors.subtle, fontWeight:'600' },

  // Empty
  emptyWrap:  { flex:1, alignItems:'center', justifyContent:'center', padding:32 },
  emptyTitle: { fontSize:18, fontWeight:'800', color:colors.text, marginBottom:6 },
  emptyDesc:  { fontSize:14, color:colors.muted },
});
