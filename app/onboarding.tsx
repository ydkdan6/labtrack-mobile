import React from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView, MotiText } from 'moti';
import { Button, Container } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <Container safeArea padding="lg" style={styles.container}>
      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 1000 }}
          style={styles.imageContainer}
        >
          <View style={styles.circle} />
          {/* Placeholder for a lab-themed illustration */}
          <Text style={styles.emoji}>🧪</Text>
        </MotiView>

        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300, type: 'timing', duration: 800 }}
          style={styles.title}
        >
          LabTrack Mobile
        </MotiText>

        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500, type: 'timing', duration: 800 }}
          style={styles.subtitle}
        >
          Effortlessly manage laboratory resources, track equipment, and monitor borrowing records in real-time.
        </MotiText>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 800, type: 'timing', duration: 800 }}
        style={styles.footer}
      >
        <Button
          variant="primary"
          size="lg"
          onPress={() => router.push('/auth/login')}
          style={styles.button}
        >
          Get Started
        </Button>
      </MotiView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  circle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: width * 0.3,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: 0.2,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    ...typography.display,
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  footer: {
    width: '100%',
    paddingBottom: spacing.xl,
  },
  button: {
    width: '100%',
  },
});
