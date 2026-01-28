import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { MotiView } from 'moti';
import { supabase } from '@/lib/supabase';
import { Button, Input, Container } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { platformBehavior } from '@/constants/platform';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
    } else {
      Alert.alert('Success', 'Registration successful! You can now sign in.');
      router.replace('/auth/login');
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join LabTrack and start managing resources efficiently.</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 200, type: 'spring' }}
            style={styles.form}
          >
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />
            <View style={{ height: spacing.md }} />
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
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Register as:</Text>
              <View style={styles.roleButtons}>
                <Button
                  variant={role === 'user' ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setRole('user')}
                  style={styles.roleButton}
                >
                  User
                </Button>
                <Button
                  variant={role === 'admin' ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setRole('admin')}
                  style={styles.roleButton}
                >
                  Admin
                </Button>
              </View>
            </View>

            <Button
              variant="primary"
              size="lg"
              onPress={signUpWithEmail}
              loading={loading}
              style={styles.button}
            >
              Sign Up
            </Button>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/auth/login" asChild>
                <Text style={styles.loginLink}>Sign In</Text>
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
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
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
  roleContainer: {
    marginTop: spacing.lg,
  },
  roleLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleButton: {
    flex: 1,
  },
  button: {
    marginTop: spacing.xl,
    width: '100%',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
