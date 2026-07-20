import { Tabs } from 'expo-router';

import { SoraTabBar } from '@/components/SoraTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <SoraTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="affirm" options={{ title: 'Affirm' }} />
      <Tabs.Screen name="vision" options={{ title: 'Vision' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
