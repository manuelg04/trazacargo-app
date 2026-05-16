import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { StatusBadge } from '@/src/components/StatusBadge';
import { profileStatusLabels, roleLabels } from '@/src/constants/access';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export default function AccountScreen() {
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

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <AppScreen title="Cuenta" subtitle="Información del acceso activo en TrazaCargo.">
      <AppCard>
        <View style={styles.row}>
          <Text style={styles.label}>Correo</Text>
          <Text style={styles.value}>{currentProfile.user.email ?? 'No disponible'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Conductor</Text>
          <Text style={styles.value}>{currentProfile.driver?.fullName ?? 'No aplica'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Empresa</Text>
          <Text style={styles.value}>{currentProfile.company?.name ?? 'No disponible'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Rol</Text>
          <Text style={styles.value}>{profile ? roleLabels[profile.role] : 'Sin perfil'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Estado</Text>
          {profile ? <StatusBadge status={profile.status} /> : <Text style={styles.value}>{profileStatusLabels.DISABLED}</Text>}
        </View>
      </AppCard>

      <View style={styles.actions}>
        {__DEV__ ? (
          <AppButton title="Ver datos demo" variant="secondary" onPress={() => router.push('/(dev)/seed')} />
        ) : null}
        <AppButton title="Cerrar sesión" variant="danger" onPress={handleSignOut} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statusRow: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  label: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '700',
  },
  value: {
    ...typography.body,
    color: colors.text,
  },
  actions: {
    gap: spacing.md,
  },
});
