import { ScrollView, StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { spacing, type } from '@/constants/theme';

// Temporary shell content while screens are built one per session.
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{title}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.screenTop,
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.screenBottom,
  },
  title: {
    ...type.screenTitle,
  },
});
