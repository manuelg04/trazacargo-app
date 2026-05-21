import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';
import { KeyboardAwareScrollView } from '@/src/components/KeyboardAwareScrollView';
import { getKeyboardAwareBottomPadding } from '@/src/utils/keyboardAwareScroll';

type AppScreenProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

export function AppScreen({ children, scroll = true, contentStyle }: AppScreenProps) {
  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      {scroll ? (
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {content}
        </KeyboardAwareScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bgCanvas,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    gap: spacing[4],
    padding: spacing[4],
    paddingBottom: getKeyboardAwareBottomPadding(spacing[4]),
  },
});
