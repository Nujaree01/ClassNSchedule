// ============================================================
//  screens/main/DashboardScreen.js
// ============================================================
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Card, SectionHeader, StatusBadge, Chip, colors } from '../../components/UI';

const DAY_MAP = {0:'sunday',1:'monday',2:'tuesday',3:'wednesday',4:'thursday',5:'friday',6:'saturday'};

export default function DashboardScreen({ navigation }) {
  const { profile, subjects, schedules, homeworks, notifications } = useApp();
  const today    = new Date();
  const todayKey = DAY_MAP[today.getDay()];

  const todaySc = schedules.filter(s => s.day === todayKey).sort((a,b) => a.startTime.localeCompare(b.startTime));
  const pending = homeworks.filter(h => h.status === 'pending');
  const done    = homeworks.filter(h => h.status === 'done');
  const overdue = pending.filter(h => new Date(h.dueDate) < today);
  const soon    = pending.filter(h => {
    const d = Math.ceil((new Date(h.dueDate) - today) / 86400000);
    return d >= 0 && d <= 3;
  }).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

  const getSub  = id => subjects.find(s => s.id === id);
  const dateStr = today.toLocaleDateString('th-TH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const unread  = notifications.length;

  const stats = [
    { n:todaySc.length, label:'วิชาวันนี้', color:colors.primary, bg:'#dbeafe', icon:'📅' },
    { n:pending.length, label:'ค้างส่ง',    color:colors.warning, bg:'#fef3c7', icon:'📝' },
    { n:done.length,    label:'ส่งแล้ว',    color:colors.success, bg:'#dcfce7', icon:'✅' },
    { n:overdue.length, label:'เกินกำหนด',  color:colors.danger,  bg:'#fee2e2', icon:'❗' },
  ];

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>

      {/* ── Banner ── */}
      <View style={st.banner}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={st.bannerHi}>สวัสดี {profile?.name?.split(' ')[0] || 'คุณ'} 👋</Text>
          <Text style={st.bannerDate}>{dateStr}</Text>
          {overdue.length > 0 && (
            <View style={st.overdueAlert}>
              <Text style={{ color:'white', fontWeight:'700', fontSize:12 }}>
                ⚠️ มีงานค้างส่ง {overdue.length} ชิ้น
              </Text>
            </View>
          )}
        </View>

        <View style={{ alignItems:'center', gap:8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={st.bellWrap}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize:22 }}>🔔</Text>
            {unread > 0 && (
              <View style={st.badge}>
                <Text style={st.badgeTxt}>{unread > 99 ? '99+' : unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats ── */}
      <View style={st.statsRow}>
        {stats.map(s => (
          <View key={s.label} style={[st.statCard, { backgroundColor:s.bg }]}>
            <Text style={[st.statNum, { color:s.color }]}>{s.n}</Text>
            <Text style={[st.statLabel, { color:s.color }]}>{s.icon}{'\n'}{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── ตารางวันนี้ ── */}
      <Card style={st.section}>
        <SectionHeader title="📅 ตารางวันนี้" action="ดูทั้งหมด" onAction={() => navigation.navigate('Schedule')} />
        {todaySc.length === 0
          ? <Text style={st.empty}>ไม่มีคลาสเรียนวันนี้ 🎉</Text>
          : todaySc.map(sc => {
              const sub = getSub(sc.subjectId);
              return (
                <View key={sc.id} style={[st.scItem, { borderLeftColor: sub?.color || colors.primary }]}>
                  <Text style={st.scTime}>{sc.startTime}{'\n'}{sc.endTime}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={[st.scName, { color: sub?.color || colors.primary }]}>{sub?.name}</Text>
                    <Text style={st.scMeta}>{sub?.code}{sc.room ? ` · ${sc.room}` : ''}</Text>
                  </View>
                </View>
              );
            })
        }
      </Card>

      {/* ── งานใกล้กำหนดส่ง ── */}
      <Card style={st.section}>
        <SectionHeader title="⚠️ งานใกล้กำหนดส่ง" action="ดูทั้งหมด" onAction={() => navigation.navigate('Homework')} />
        {soon.length === 0
          ? <Text style={st.empty}>ไม่มีงานใกล้กำหนดส่ง 🎉</Text>
          : soon.slice(0, 4).map(hw => {
              const sub = getSub(hw.subjectId);
              return (
                <View key={hw.id} style={st.hwItem}>
                  <View style={{ flex:1 }}>
                    <Text style={st.hwTitle}>{hw.title}</Text>
                    <View style={st.hwMeta}>
                      <Chip label={sub?.code || '?'} color={sub?.color || colors.primary} small />
                      <StatusBadge dueDate={hw.dueDate} status={hw.status} />
                    </View>
                  </View>
                </View>
              );
            })
        }
      </Card>

    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex:1, backgroundColor:colors.bg },
  content:   { padding:16, paddingBottom:32 },

  banner: {
    backgroundColor:colors.primary, borderRadius:20, padding:20,
    flexDirection:'row', alignItems:'flex-start',
    marginBottom:16,
    shadowColor:colors.primary, shadowOffset:{width:0,height:8},
    shadowOpacity:0.3, shadowRadius:16, elevation:8,
  },
  bannerHi:    { fontSize:22, fontWeight:'800', color:'white', marginBottom:4 },
  bannerDate:  { fontSize:12, color:'rgba(255,255,255,0.85)' },
  overdueAlert:{ marginTop:10, backgroundColor:'rgba(255,255,255,0.2)', borderRadius:8, paddingVertical:5, paddingHorizontal:10 },

  // 🔔 กระดิ่ง
  bellWrap: {
    backgroundColor:'rgba(255,255,255,0.25)', borderRadius:14,
    width:46, height:46, alignItems:'center', justifyContent:'center',
  },
  badge: {
    position:'absolute', top:-5, right:-5,
    backgroundColor:colors.danger,
    borderRadius:9, minWidth:18, height:18,
    alignItems:'center', justifyContent:'center',
    paddingHorizontal:3,
    borderWidth:2, borderColor:colors.primary,
  },
  badgeTxt: { color:'white', fontSize:9, fontWeight:'800' },

  statsRow: { flexDirection:'row', gap:10, marginBottom:16 },
  statCard: { flex:1, borderRadius:14, padding:12, alignItems:'center' },
  statNum:  { fontSize:24, fontWeight:'800', marginBottom:4 },
  statLabel:{ fontSize:10, fontWeight:'600', textAlign:'center', lineHeight:14 },

  section:  { marginBottom:16 },
  empty:    { color:colors.subtle, fontSize:14, textAlign:'center', paddingVertical:16 },

  scItem:  { flexDirection:'row', gap:10, marginBottom:10, padding:10, borderRadius:10, backgroundColor:'#f8fafc', borderLeftWidth:4 },
  scTime:  { fontFamily:'monospace', fontSize:10, color:colors.muted, width:50, marginTop:2, lineHeight:16 },
  scName:  { fontSize:14, fontWeight:'700', marginBottom:2 },
  scMeta:  { fontSize:12, color:colors.muted },

  hwItem:  { backgroundColor:'#fffbeb', borderRadius:10, padding:12, marginBottom:8, borderLeftWidth:3, borderLeftColor:'#fbbf24' },
  hwTitle: { fontSize:14, fontWeight:'700', color:colors.text, marginBottom:6 },
  hwMeta:  { flexDirection:'row', gap:6, alignItems:'center', flexWrap:'wrap' },
});
