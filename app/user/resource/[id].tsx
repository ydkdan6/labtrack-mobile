import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Container, Button, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';

interface Resource {
  id: string;
  name: string;
  description: string;
  type: 'equipment' | 'consumable' | 'tool';
  quantity: number;
  status: 'available' | 'maintenance' | 'out_of_stock';
  condition: string;
}

export default function ResourceDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Resource;
    },
  });

  const borrowMutation = useMutation({
    mutationFn: async () => {
      if (!resource || !user) return;

      // 1. Create borrow record
      const { error: borrowError } = await supabase
        .from('borrow_records')
        .insert({
          user_id: user.id,
          resource_id: resource.id,
          status: 'borrowed',
        });

      if (borrowError) throw borrowError;

      // 2. Update resource quantity/status if needed
      const newQuantity = resource.quantity - 1;
      const newStatus = newQuantity === 0 ? 'out_of_stock' : 'available';

      const { error: updateError } = await supabase
        .from('resources')
        .update({ 
          quantity: newQuantity,
          status: newStatus 
        })
        .eq('id', resource.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      Alert.alert('Success', `You have borrowed ${resource?.name}. Please return it after use.`);
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource', id] });
      queryClient.invalidateQueries({ queryKey: ['my-borrows'] });
      router.replace('/(tabs)/user/my-borrows');
    },
    onError: (error) => {
      console.error('Error borrowing resource:', error);
      Alert.alert('Error', 'Failed to process borrowing request.');
    },
  });

  const handleBorrow = () => {
    if (!resource || !user) return;

    if (resource.status !== 'available' || resource.quantity <= 0) {
      Alert.alert('Unavailable', 'This resource is currently not available for borrowing.');
      return;
    }

    Alert.alert(
      'Confirm Borrow',
      `Are you sure you want to borrow ${resource.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => borrowMutation.mutate()
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!resource) return null;

  return (
    <Container safeArea padding="lg" style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Resource Details',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { ...typography.h3 }
      }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
          style={styles.imagePlaceholder}
        >
          <Ionicons 
            name={resource.type === 'equipment' ? 'hardware-chip' : resource.type === 'consumable' ? 'flask' : 'construct'} 
            size={80} 
            color={colors.primary} 
          />
        </MotiView>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{resource.name}</Text>
            <View style={[styles.typeBadge, { backgroundColor: colors.primaryTint }]}>
              <Text style={styles.typeText}>{resource.type}</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text style={styles.statusLabel}>Status: </Text>
              <Text style={[styles.statusValue, { color: resource.status === 'available' ? colors.success : colors.error }]}>
                {resource.status.replace(/_/g, ' ')}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.statusLabel}>Condition: </Text>
              <Text style={styles.statusValue}>{resource.condition}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{resource.description}</Text>

          <Card variant="outline" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Available Quantity</Text>
                <Text style={styles.infoValue}>{resource.quantity}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Resource ID</Text>
                <Text style={styles.infoValueSmall}>{resource.id.substring(0, 8)}...</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleBorrow}
          loading={borrowMutation.isPending}
          disabled={resource.status !== 'available' || resource.quantity <= 0}
          style={styles.borrowButton}
          leftIcon={<Ionicons name="hand-right" size={20} color={colors.white} />}
        >
          Borrow Now
        </Button>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.h1,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  typeText: {
    ...typography.captionBold,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  statusValue: {
    ...typography.captionBold,
    color: colors.text,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  infoCard: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.tiny,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.h2,
    color: colors.primary,
  },
  infoValueSmall: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  infoDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.borderLight,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  borrowButton: {
    width: '100%',
  },
});
