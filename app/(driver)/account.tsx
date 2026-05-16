import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { StatusBadge } from '@/src/components/StatusBadge';
import { profileStatusLabels } from '@/src/constants/access';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';

export default function AccountScreen() {
  const { signOut } = useAuthActions();
  const { currentProfile, isProfileLoading } = useCurrentProfile();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  if (isProfileLoading || !currentProfile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgCanvas }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.brand500 }}>
          <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: 14 }}>
            <Text style={{ color: colors.textInverse, fontFamily: fontFamily.extrabold, fontSize: fontSize.xl }}>
              Mi cuenta
            </Text>
          </View>
        </SafeAreaView>
        <AppScreen scroll={false}>
          <AppLoading message="Cargando cuenta" />
        </AppScreen>
      </View>
    );
  }

  const profile = currentProfile.profile;
  const driverName = currentProfile.driver?.fullName ?? 'Mi cuenta';
  const email = currentProfile.user.email ?? 'No disponible';
  const companyName = currentProfile.company?.name ?? 'No disponible';
  const initials = driverName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgCanvas }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.brand500 }}>
        <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: 14 }}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textInverse, fontFamily: fontFamily.extrabold, fontSize: fontSize.xl }}>
                {driverName}
              </Text>
              <Text style={{ color: colors.textInverse, opacity: 0.75, fontFamily: fontFamily.regular, fontSize: fontSize.sm }}>
                {email}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <AppScreen scroll={true}>
        <AppCard>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>{email}</Text>
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.label}>Conductor</Text>
            <Text style={styles.value}>{currentProfile.driver?.fullName ?? 'No aplica'}</Text>
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.label}>Empresa</Text>
            <Text style={styles.value}>{companyName}</Text>
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.label}>Rol</Text>
            <View style={styles.valueCell}>
              {profile ? (
                <StatusBadge status={profile.role} />
              ) : (
                <Text style={styles.value}>Sin perfil</Text>
              )}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.valueCell}>
              {profile ? (
                <StatusBadge status={profile.status} />
              ) : (
                <Text style={styles.value}>{profileStatusLabels.DISABLED}</Text>
              )}
            </View>
          </View>
        </AppCard>

        <View style={styles.actions}>
          {__DEV__ ? (
            <AppButton
              label="Ver datos demo"
              variant="ghost"
              onPress={() => router.push('/(dev)/seed')}
              fullWidth
            />
          ) : null}
          <AppButton label="Cerrar sesión" variant="ghost" onPress={handleSignOut} fullWidth />
        </View>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[3],
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarText: {
    color: colors.textInverse,
    fontFamily: fontFamily.extrabold,
    fontSize: 20,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  value: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing[3],
  },
  valueCell: {
    alignItems: 'flex-end',
  },
  actions: {
    gap: spacing[3],
  },
});
