import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Container, Card, Button } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';

interface BorrowRecord {
  id: string;
  resource_id: string;
  borrow_date: string;
  return_date: string | null;
  status: 'borrowed' | 'returned' | 'overdue';
  resource: {
    name: string;
    type: string;
  };
}

export default function MyBorrows() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-borrows', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('borrow_records')
        .select(`
          *,
          resource:resources(name, type)
        `)
        .eq('user_id', user.id)
        .order('borrow_date', { ascending: false });

      if (error) throw error;
      return data as BorrowRecord[];
    },
    enabled: !!user,
  });

  const returnMutation = useMutation({
    mutationFn: async (record: BorrowRecord) => {
      // 1. Update borrow record
      const { error: recordError } = await supabase
        .from('borrow_records')
        .update({ 
          status: 'returned',
          return_date: new Date().toISOString()
        })
        .eq('id', record.id);

      if (recordError) throw recordError;

      // 2. Increment resource quantity
      const { data: resourceData } = await supabase
        .from('resources')
        .select('quantity')
        .eq('id', record.resource_id)
        .single();

      if (resourceData) {
        const newQuantity = resourceData.quantity + 1;
        await supabase
          .from('resources')
          .update({ 
            quantity: newQuantity,
            status: 'available'
          })
          .eq('id', record.resource_id);
      }
    },
    onSuccess: () => {
      Alert.alert('Success', 'Resource returned successfully.');
      queryClient.invalidateQueries({ queryKey: ['my-borrows'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (error) => {
      console.error('Error returning resource:', error);
      Alert.alert('Error', 'Failed to return resource.');
    },
  });

  const handleReturn = (record: BorrowRecord) => {
    Alert.alert(
      'Return Resource',
      `Are you sure you want to return ${record.resource.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Return',
          onPress: () => returnMutation.mutate(record)
        }
      ]
    );
  };

  const renderItem = ({ item, index }: { item: BorrowRecord, index: number }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 50, type: 'timing', duration: 400 }}
    >
      <Card variant="outline" style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceName}>{item.resource.name}</Text>
              <Text style={styles.dateText}>
                Borrowed: {new Date(item.borrow_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.status === 'returned' ? colors.successTint : colors.warningTint }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: item.status === 'returned' ? colors.successDark : colors.warningDark }
              ]}>
                {item.status}
              </Text>
            </View>
          </View>

          {item.status === 'borrowed' && (
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleReturn(item)}
              style={styles.returnButton}
              leftIcon={<Ionicons name="return-down-back" size={16} color={colors.primary} />}
            >
              Return Item
            </Button>
          )}

          {item.status === 'returned' && item.return_date && (
            <Text style={styles.returnedDate}>
              Returned: {new Date(item.return_date).toLocaleDateString()}
            </Text>
          )}
        </Card.Content>
      </Card>
    </MotiView>
  );

  return (
    <Container safeArea padding="lg" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Borrowing History</Text>
        <Text style={styles.subtitle}>Track your items and return them when finished.</Text>
      </View>

      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            colors={[colors.primary]} 
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={60} color={colors.textTertiary} />
              <Text style={styles.emptyText}>You haven't borrowed any items yet.</Text>
            </View>
          ) : null
        }
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.primaryDark,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  resourceInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  resourceName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 2,
  },
  dateText: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.tiny,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  returnButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    borderColor: colors.primary,
  },
  returnedDate: {
    ...typography.tiny,
    color: colors.successDark,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
