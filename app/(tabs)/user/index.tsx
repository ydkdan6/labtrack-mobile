import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Container, Card, Input } from '@/components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';

interface Resource {
  id: string;
  name: string;
  description: string;
  type: 'equipment' | 'consumable' | 'tool';
  quantity: number;
  status: 'available' | 'maintenance' | 'out_of_stock';
  condition: string;
}

export default function UserCatalog() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: resources = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Resource[];
    },
  });

  const filteredResources = resources.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return colors.success;
      case 'maintenance': return colors.warning;
      case 'out_of_stock': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const renderItem = ({ item, index }: { item: Resource, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: 'timing', duration: 500 }}
    >
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/user/resource/[id]', params: { id: item.id } })}
        activeOpacity={0.7}
      >
        <Card variant="elevated" style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={item.type === 'equipment' ? 'hardware-chip' : item.type === 'consumable' ? 'flask' : 'construct'} 
                  size={24} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={styles.statusText}>{item.status.replace(/_/g, ' ')}</Text>
              </View>
            </View>
            <Text style={styles.resourceName}>{item.name}</Text>
            <Text style={styles.resourceDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
              <Text style={styles.conditionText}>Cond: {item.condition}</Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <Container safeArea padding="lg" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lab Resources</Text>
        <Text style={styles.subtitle}>Browse and borrow tools for your research.</Text>
      </View>

      <Input
        placeholder="Search resources..."
        value={search}
        onChangeText={setSearch}
        leftIcon={<Ionicons name="search" size={20} color={colors.textTertiary} />}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredResources}
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
              <Ionicons name="search-outline" size={60} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No resources found matching your search.</Text>
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
  searchBar: {
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.tiny,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  resourceName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  resourceDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  quantityText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  conditionText: {
    ...typography.caption,
    color: colors.textTertiary,
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
