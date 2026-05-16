import { useMutation } from 'convex/react';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppScreen } from '@/src/components/AppScreen';
import { StatusBadge } from '@/src/components/StatusBadge';
import { roleLabels } from '@/src/constants/access';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

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
    <AppScreen title="Datos demo" subtitle="Pantalla temporal de desarrollo para preparar pruebas con conductores.">
      <View style={styles.actions}>
        <AppButton title="Crear datos demo" onPress={handleSeed} loading={isSeeding} />
        <AppButton title="Borrar datos demo" variant="danger" onPress={handleClear} loading={isClearing} />
      </View>

      {!seedResult ? (
        <AppEmptyState title="Sin códigos cargados" message="Crea los datos demo para ver los códigos de acceso." />
      ) : null}

      <View style={styles.list}>
        {seedResult?.accessCodes.map((accessCode) => (
          <AppCard key={accessCode.code}>
            <View style={styles.codeHeader}>
              <View style={styles.codeText}>
                <Text style={styles.code}>{accessCode.code}</Text>
                <Text style={styles.meta}>{accessCode.companyName}</Text>
                {accessCode.driverName ? <Text style={styles.meta}>{accessCode.driverName}</Text> : null}
                <Text style={styles.meta}>{roleLabels[accessCode.role]}</Text>
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
  actions: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  codeHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  codeText: {
    flex: 1,
    gap: spacing.xs,
  },
  code: {
    ...typography.cardTitle,
    color: colors.text,
  },
  meta: {
    ...typography.body,
    color: colors.textMuted,
  },
});
