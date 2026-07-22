import { useRouter } from 'expo-router';

import { NewGoalSheet } from '@/components/NewGoalSheet';

// Transparent-modal route so the sheet renders above the floating tab bar
// (in-tab content sits below it). Matches the log-sign pattern.
export default function NewGoalRoute() {
  const router = useRouter();
  return <NewGoalSheet onClose={() => router.back()} />;
}
