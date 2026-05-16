import { useContext } from 'react';
import { DevSessionContext } from '@/src/features/devSession/DevSessionContext';

export function useDevSession() {
  const context = useContext(DevSessionContext);

  if (!context) {
    throw new Error('DevSessionContext is not available');
  }

  return context;
}
