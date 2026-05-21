import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from 'react-native';
import { getKeyboardAvoidingBehavior } from '@/src/utils/keyboardAwareScroll';

type KeyboardAwareScrollViewProps = ScrollViewProps & {
  children: ReactNode;
  keyboardVerticalOffset?: number;
};

export function KeyboardAwareScrollView({
  children,
  keyboardShouldPersistTaps = 'handled',
  keyboardVerticalOffset = 0,
  showsVerticalScrollIndicator = false,
  style,
  ...scrollProps
}: KeyboardAwareScrollViewProps) {
  return (
    <KeyboardAvoidingView
      behavior={getKeyboardAvoidingBehavior(Platform.OS)}
      enabled={Platform.OS !== 'web'}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={[styles.container, style]}>
      <ScrollView
        {...scrollProps}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
