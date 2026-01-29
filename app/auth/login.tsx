import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { MotiView } from 'moti';
import { supabase } from '@/lib/supabase';
import { Button, Input, Container } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { platformBehavior } from '@/constants/platform';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

 async function signInWithEmail() {
  setLoading(true);
  try {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    // Fetch the user's profile to determine role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.session.user.id)
      .single();

    setLoading(false);

    if (profileError) {
      console.warn('Profile fetch error:', profileError);
      router.replace('/(tabs)/user'); // Default to user if profile fetch fails
    } else {
      // Navigate based on role
      if (profileData.role === 'admin') {
        router.replace('/(tabs)/admin');
      } else {
        router.replace('/(tabs)/user');
      }
    }
  } catch (err) {
    console.error('Login error:', err);
    Alert.alert('Error', 'An unexpected error occurred');
    setLoading(false);
  }
}

  return (
    <Container safeArea padding="lg" style={styles.container}>
      <KeyboardAvoidingView
        behavior={platformBehavior.keyboardBehavior}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800 }}
            style={styles.header}
          >
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue managing laboratory resources.</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 200, type: 'spring' }}
            style={styles.form}
          >
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={{ height: spacing.md }} />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              variant="primary"
              size="lg"
              onPress={signInWithEmail}
              loading={loading}
              style={styles.button}
            >
              Sign In
            </Button>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Link href="/auth/register" asChild>
                <Text style={styles.signupLink}>Sign Up</Text>
              </Link>
            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: spacing.xl,
    width: '100%',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  signupText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  signupLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
