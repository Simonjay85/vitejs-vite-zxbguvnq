import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import LiveEventScreen from './screens/LiveEvent/LiveEventScreen';
import { useEventStore } from './store/useEventStore';
import { COLORS } from './theme';

const Tab = createBottomTabNavigator();

// Placeholder screens for future tabs
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={ph.screen}>
    <Text style={ph.icon}>🚧</Text>
    <Text style={ph.title}>{title}</Text>
    <Text style={ph.sub}>Đang phát triển...</Text>
  </View>
);

const ph = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '900', color: COLORS.text, marginBottom: 6 },
  sub: { fontSize: 13, color: COLORS.muted },
});

export default function App() {
  const subscribeToEvent = useEventStore(s => s.subscribeToEvent);
  const announcement = useEventStore(s => s.announcement);

  // Start Firebase subscription on app mount
  useEffect(() => {
    const unsub = subscribeToEvent();
    return unsub;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.bg} />

      {/* Global announcement banner */}
      {announcement ? (
        <View style={styles.announcementBanner}>
          <Text style={styles.announcementText} numberOfLines={1}>
            📢 {announcement}
          </Text>
        </View>
      ) : null}

      <NavigationContainer theme={{
        dark: true,
        colors: {
          primary: COLORS.accent,
          background: COLORS.bg,
          card: COLORS.panel,
          text: COLORS.text,
          border: COLORS.border,
          notification: COLORS.red,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: COLORS.panel,
              borderTopColor: COLORS.border,
              borderTopWidth: 1,
              height: 60,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: COLORS.accent,
            tabBarInactiveTintColor: COLORS.muted,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
            tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => {
              const icons: Record<string, string> = {
                LiveEvent: '🏟️',
                ScoreInput: '🏓',
                Leaderboard: '🏆',
                Profile: '👤',
              };
              return (
                <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
                  {icons[route.name] || '📱'}
                </Text>
              );
            },
          })}
        >
          <Tab.Screen name="LiveEvent" component={LiveEventScreen} options={{ title: 'Live Event' }} />
          <Tab.Screen name="ScoreInput" component={() => <PlaceholderScreen title="Nhập điểm" />} options={{ title: 'Điểm số' }} />
          <Tab.Screen name="Leaderboard" component={() => <PlaceholderScreen title="Bảng xếp hạng" />} options={{ title: 'Xếp hạng' }} />
          <Tab.Screen name="Profile" component={() => <PlaceholderScreen title="Hồ sơ cá nhân" />} options={{ title: 'Hồ sơ' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  announcementBanner: {
    backgroundColor: COLORS.red,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  announcementText: {
    color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center',
  },
});
