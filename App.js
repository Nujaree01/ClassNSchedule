// ============================================================
//  App.js
// ============================================================
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';

import { AppProvider, useApp } from './context/AppContext';
import { LoadingScreen, Toast, colors } from './components/UI';

import LoginScreen         from './screens/auth/LoginScreen';
import DashboardScreen     from './screens/main/DashboardScreen';
import ScheduleScreen      from './screens/main/ScheduleScreen';
import HomeworkScreen      from './screens/main/HomeworkScreen';
import NotificationsScreen from './screens/main/NotificationsScreen';
import ProfileScreen       from './screens/main/ProfileScreen';
import SubjectsScreen      from './screens/main/SubjectsScreen';
import UsersScreen         from './screens/admin/UsersScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function TabIcon({ icon, label, focused, ac }) {
  return (
    <View style={{ alignItems:'center', paddingTop:4 }}>
      <Text style={{ fontSize:22 }}>{icon}</Text>
      <Text style={{ fontSize:10, marginTop:3, fontWeight:focused?'700':'500',
        color: focused ? (ac||colors.primary) : colors.subtle }}>{label}</Text>
    </View>
  );
}

function LogoutBtn({ logout, light }) {
  return (
    <TouchableOpacity onPress={logout} style={{
      marginRight:16, paddingHorizontal:12, paddingVertical:6,
      borderRadius:8, borderWidth:1,
      backgroundColor: light ? 'rgba(255,255,255,0.2)' : '#fef2f2',
      borderColor:     light ? 'rgba(255,255,255,0.4)' : '#fecaca',
    }}>
      <Text style={{ color: light?'white':colors.danger, fontWeight:'700', fontSize:12 }}>ออกจากระบบ</Text>
    </TouchableOpacity>
  );
}

// ── Student Tab Bar: 4 tabs  ───────────────────────
function StudentTabs() {
  const { logout } = useApp();
  return (
    <Tab.Navigator screenOptions={{
      headerStyle:      { backgroundColor:'blue', elevation:1, shadowOpacity:0.06 },
      headerTitleStyle: { fontWeight:'800', fontSize:18, color:'white' },
      tabBarStyle:      { backgroundColor:'white', borderTopColor:colors.border, height:70, paddingBottom:8 },
      tabBarShowLabel:  false,
      headerRight:      () => <LogoutBtn logout={logout} />,
    }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ title:'ClassSchedule',
          tabBarIcon: ({focused}) => <TabIcon icon="🏠" label="Main" focused={focused}  ac={colors.blue} /> }} />
      <Tab.Screen name="Schedule" component={ScheduleScreen}
        options={{ title:'Schedule',
          tabBarIcon: ({focused}) => <TabIcon icon="📅" label="Schedule" focused={focused} ac={colors.blue}/> }} />
      <Tab.Screen name="Homework" component={HomeworkScreen}
        options={{ title:'Homework',
          tabBarIcon: ({focused}) => <TabIcon icon="📝" label="Homework" focused={focused} ac={colors.blue}/> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ title:'Profile',
          tabBarIcon: ({focused}) => <TabIcon icon="👤" label="Profile" focused={focused} ac={colors.blue}/> }} />
    </Tab.Navigator>
  );
}

// ── Student Stack: Tabs  ───────────────
function StudentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="Tabs" component={StudentTabs} />
      <Stack.Screen name="Notifications" component={NotificationsScreen}
        options={{ animation:'slide_from_right' }} />
    </Stack.Navigator>
  );
}

// ── Admin Tabs ────────────────────────────────────────────────
function AdminTabs() {
  const { logout } = useApp();
  return (
    <Tab.Navigator screenOptions={{
      headerStyle:      { backgroundColor:colors.purple, elevation:0 },
      headerTitleStyle: { fontWeight:'800', fontSize:18, color:'white' },
      tabBarStyle:      { backgroundColor:'white', borderTopColor:colors.border, height:70, paddingBottom:8 },
      tabBarShowLabel:  false,
      headerRight:      () => <LogoutBtn logout={logout} light />,
    }}>
      <Tab.Screen name="Users" component={UsersScreen}
        options={{ title:'👑 Admin — Manage User',
          tabBarIcon: ({focused}) => <TabIcon icon="👥" label="User" focused={focused} ac={colors.purple} /> }} />
      <Tab.Screen name="Subjects" component={SubjectsScreen}
        options={{ title:'👑 Admin — Manage Subject',
          tabBarIcon: ({focused}) => <TabIcon icon="📚" label="Subject" focused={focused} ac={colors.purple} /> }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, profile, loading, toast } = useApp();
  if (loading) return <LoadingScreen message="กำลังตรวจสอบการเข้าสู่ระบบ..." />;
  const isAdmin = profile?.role === 'admin';
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown:false }}>
          {!user
            ? <Stack.Screen name="Login"        component={LoginScreen}   />
            : isAdmin
            ? <Stack.Screen name="AdminMain"    component={AdminTabs}     />
            : <Stack.Screen name="StudentMain"  component={StudentStack}  />
          }
        </Stack.Navigator>
      </NavigationContainer>
      <Toast toast={toast} />
    </>
  );
}

export default function App() {
  return <AppProvider><AppNavigator /></AppProvider>;
}
