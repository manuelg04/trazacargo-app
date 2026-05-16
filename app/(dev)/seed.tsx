import { useMutation } from 'convex/react';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppScreen } from '@/src/components/AppScreen';
import { StatusBadge } from '@/src/components/StatusBadge';
import { colors, fontFamily, fontSize, radius, roleLabels, spacing } from '@/constants/theme';

type SeedResult = {
  accessCodes: {
    code: string;
    status: 'ACTIVE' | 'USED' | 'DISABLED' | 'EXPIRED';
    role: 'DRIVER' | 'DISPATCHER' | 'ADMIN';
    driverName?: string;
    companyName: string;
  }[];
};

export default function SeedScreen() {
  const seedDemoData = useMutation(api.dev.seedDemoData);
  const clearDemoData = useMutation(api.dev.clearDemoData);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);

    try {
      const result = await seedDemoData({});
      setSeedResult(result);
    } catch {
      Alert.alert('No se pudo sembrar', 'Revisa que Convex esté corriendo y vuelve a intentar.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);

    try {
      await clearDemoData({});
      setSeedResult(null);
    } catch {
      Alert.alert('No se pudo limpiar', 'Revisa que Convex esté corriendo y vuelve a intentar.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AppScreen>
      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>⚠ Pantalla temporal de desarrollo</Text>
        <Text style={styles.warningText}>No incluir en builds de producción.</Text>
      </View>

      <View style={styles.actions}>
        <AppButton label="Crear datos demo" onPress={handleSeed} loading={isSeeding} fullWidth />
        <AppButton label="Limpiar datos demo" variant="danger" onPress={handleClear} loading={isClearing} fullWidth />
      </View>

      {!seedResult ? (
        <AppEmptyState
          title="Sin códigos cargados"
          message="Crea los datos demo para ver los códigos de acceso."
        />
      ) : null}

      <View style={styles.list}>
        {seedResult?.accessCodes.map((accessCode) => (
          <AppCard key={accessCode.code}>
            <View style={styles.codeRow}>
              <View style={styles.codeInfo}>
                <Text style={styles.code}>{accessCode.code}</Text>
                <Text style={styles.meta}>{accessCode.companyName}</Text>
                {accessCode.driverName ? (
                  <Text style={styles.meta}>{accessCode.driverName}</Text>
                ) : null}
                <Text style={styles.meta}>{roleLabels[accessCode.role] ?? accessCode.role}</Text>
              </View>
              <StatusBadge status={accessCode.status} />
            </View>
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  warningBox: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
    borderRadius: radius.btn,
    borderWidth: 1.5,
    padding: spacing[4],
  },
  warningTitle: {
    color: colors.error,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  warningText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  actions: {
    gap: spacing[3],
  },
  list: {
    gap: spacing[3],
  },
  codeRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
  },
  codeInfo: {
    flex: 1,
    gap: 4,
  },
  code: {
    color: colors.brand500,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    letterSpacing: 2,
  },
  meta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});
