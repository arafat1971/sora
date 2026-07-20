import { Redirect, Tabs } from 'expo-router';

import { SoraTabBar } from '@/components/SoraTabBar';
import { useOnboarding } from '@/store/onboarding';

export default function TabLayout() {
  const hydrated = useOnboarding((s) => s.hydrated);
  const completed = useOnboarding((s) => s.completed);
  const reachedPaywall = useOnboarding((s) => s.reachedPaywall);

  if (!hydrated) return null;
  if (!completed) return <Redirect href={reachedPaywall ? '/paywall' : '/onboarding'} />;

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
