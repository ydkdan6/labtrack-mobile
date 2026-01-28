import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalResources: 0,
    activeBorrows: 0,
    totalUsers: 0,
    maintenanceItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [resourcesRes, borrowsRes, usersRes] = await Promise.all([
        supabase.from('resources').select('*', { count: 'exact' }),
        supabase.from('borrow_records').select('*', { count: 'exact' }).eq('status', 'borrowed'),
        supabase.from('profiles').select('*', { count: 'exact' }),
      ]);

      const maintenanceRes = await supabase.from('resources').select('*', { count: 'exact' }).eq('status', 'maintenance');

      setStats({
        totalResources: resourcesRes.count || 0,
        activeBorrows: borrowsRes.count || 0,
        totalUsers: usersRes.count || 0,
        maintenanceItems: maintenanceRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard = ({ title, value, icon, color, index }: any) => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 100, type: 'timing' }}
      style={styles.statCardWrapper}
    >
      <Card variant="elevated" style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </Card>
    </MotiView>
  );

  return (
    <Container safeArea padding="lg" style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Laboratory Resource Management Overview</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            index={0}
            title="Total Resources"
            value={stats.totalResources}
            icon="cube"
            color={colors.primary}
          />
          <StatCard
            index={1}
            title="Active Borrows"
            value={stats.activeBorrows}
            icon="bookmark"
            color={colors.warning}
          />
          <StatCard
            index={2}
            title="Registered Users"
            value={stats.totalUsers}
            icon="people"
            color={colors.info}
          />
          <StatCard
            index={3}
            title="Under Maintenance"
            value={stats.maintenanceItems}
            icon="build"
            color={colors.error}
          />
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, type: 'timing' }}
          style={styles.recentSection}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <Card variant="outline" style={styles.actionCard}>
              <Ionicons name="add-circle" size={32} color={colors.primary} />
              <Text style={styles.actionText}>Add Resource</Text>
            </Card>
            <Card variant="outline" style={styles.actionCard}>
              <Ionicons name="person-add" size={32} color={colors.info} />
              <Text style={styles.actionText}>Manage Users</Text>
            </Card>
          </View>
        </MotiView>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.primaryDark,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
    marginBottom: spacing.xl,
  },
  statCardWrapper: {
    width: '50%',
    padding: spacing.sm,
  },
  statCard: {
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
  },
  statTitle: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  recentSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: colors.border,
  },
  actionText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
