import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { StatusBadge } from '@/src/components/StatusBadge';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';

export default function DispatcherAccountScreen() {
  const { signOut } = useAuthActions();
  const { currentProfile, isProfileLoading } = useCurrentProfile();
  const router = useRouter();

  if (isProfileLoading || !currentProfile) {
    return (
      <AppScreen>
        <AppLoading message="Cargando cuenta" />
      </AppScreen>
    );
  }

  const profile = currentProfile.profile;
  const email = currentProfile.user.email ?? 'No disponible';
  const companyName = currentProfile.company?.name ?? 'No disponible';
  const initials = email.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerEmail} numberOfLines={1}>{email}</Text>
          <Text style={styles.headerCompany} numberOfLines={1}>{companyName}</Text>
        </View>
      </View>
      <AppScreen>
        <AppCard>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Correo</Text>
            <Text style={styles.rowValue}>{email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Empresa</Text>
            <Text style={styles.rowValue}>{companyName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Rol</Text>
            <View style={styles.rowRight}>
              {profile ? <StatusBadge status={profile.role} /> : <Text style={styles.rowValue}>Sin perfil</Text>}
            </View>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Estado</Text>
            <View style={styles.rowRight}>
              {profile ? <StatusBadge status={profile.status} /> : null}
            </View>
          </View>
        </AppCard>
        {__DEV__ ? (
          <AppButton
            label="Ver datos demo"
            variant="secondary"
            fullWidth
            onPress={() => router.push('/(dev)/seed')}
          />
        ) : null}
        <AppButton label="Cerrar sesión" variant="ghost" fullWidth onPress={handleSignOut} />
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textInverse,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  headerInfo: {
    flex: 1,
  },
  headerEmail: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  headerCompany: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  rowValue: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
});
