import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Container, Button, Card, Avatar } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  if (!profile) return null;

  return (
    <Container safeArea padding="lg" style={styles.container}>
      <View style={styles.header}>
        <Avatar name={profile.full_name} size="xl" />
        <Text style={styles.name}>{profile.full_name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{profile.role}</Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <Card variant="outline" style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuLabel}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.infoTint }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.info} />
            </View>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.warningTint }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.warning} />
            </View>
            <Text style={styles.menuLabel}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          variant="outline"
          size="lg"
          onPress={handleSignOut}
          style={styles.signOutButton}
          leftIcon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
        >
          <Text style={{ color: colors.error }}>Sign Out</Text>
        </Button>
        <Text style={styles.version}>Version 1.0.0 (LabTrack Mobile)</Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  roleBadge: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  roleText: {
    ...typography.tiny,
    color: colors.primaryDark,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  email: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.white,
    padding: 0,
    borderRadius: borderRadius.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.md,
  },
  footer: {
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  signOutButton: {
    width: '100%',
    borderColor: colors.error,
  },
  version: {
    ...typography.tiny,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
});
