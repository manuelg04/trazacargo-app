import { Redirect } from 'expo-router';
import { useDevSession } from '@/src/features/devSession/useDevSession';

export default function IndexScreen() {
  const { selectedDriverId } = useDevSession();

  if (selectedDriverId) {
    return <Redirect href="/(driver)/offers" />;
  }

  return <Redirect href="/(dev)/select-driver" />;
}
