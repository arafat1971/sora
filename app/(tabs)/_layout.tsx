import { Redirect, Tabs } from 'expo-router';
import { View } from 'react-native';

import { MiniPlayer } from '@/components/MiniPlayer';
import { SoraTabBar } from '@/components/SoraTabBar';
import { useOnboarding } from '@/store/onboarding';
import { usePlaybackTick } from '@/store/playback';

export default function TabLayout() {
  const hydrated = useOnboarding((s) => s.hydrated);
  const completed = useOnboarding((s) => s.completed);
  const reachedPaywall = useOnboarding((s) => s.reachedPaywall);

  // Drive playback from the shell so progress advances when the player is
  // backgrounded to the mini-player. Safe to run before the gate — nothing
  // plays during onboarding.
  usePlaybackTick();

  if (!hydrated) return null;
  if (!completed) return <Redirect href={reachedPaywall ? '/paywall' : '/onboarding'} />;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <SoraTabBar {...props} />}
        screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="affirm" options={{ title: 'Affirm' }} />
        <Tabs.Screen name="vision" options={{ title: 'Vision' }} />
        <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}
