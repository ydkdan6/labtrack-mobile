import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/design';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (profile?.role === 'admin') {
          router.replace('/(tabs)/admin');
        } else {
          router.replace('/(tabs)/user');
        }
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isAuthenticated, profile, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
