import { createContext, ReactNode, useMemo, useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';

type SelectedDriver = {
  id: Id<'drivers'>;
  fullName: string;
};

type DevSessionContextValue = {
  selectedDriverId: Id<'drivers'> | null;
  selectedDriverName: string | null;
  selectDriver: (driver: SelectedDriver) => void;
  clearDriver: () => void;
};

export const DevSessionContext = createContext<DevSessionContextValue | null>(null);

type DevSessionProviderProps = {
  children: ReactNode;
};

export function DevSessionProvider({ children }: DevSessionProviderProps) {
  const [selectedDriver, setSelectedDriver] = useState<SelectedDriver | null>(null);

  const value = useMemo(
    () => ({
      selectedDriverId: selectedDriver?.id ?? null,
      selectedDriverName: selectedDriver?.fullName ?? null,
      selectDriver: setSelectedDriver,
      clearDriver: () => setSelectedDriver(null),
    }),
    [selectedDriver],
  );

  return <DevSessionContext.Provider value={value}>{children}</DevSessionContext.Provider>;
}
