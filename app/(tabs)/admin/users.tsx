import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Container, Card, Avatar } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';

interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export default function AdminUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as Profile[];
    },
  });

  const toggleRoleMutation = useMutation({
    mutationFn: async (user: Profile) => {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Alert.alert('Success', 'User role updated successfully.');
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      Alert.alert('Error', 'Failed to update user role.');
    },
  });

  const handleRoleToggle = (user: Profile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    Alert.alert(
      'Change Role',
      `Are you sure you want to change ${user.full_name}'s role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: () => toggleRoleMutation.mutate(user)
        }
      ]
    );
  };

  const renderItem = ({ item, index }: { item: Profile, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 50, type: 'timing' }}
    >
      <Card variant="outline" style={styles.card}>
        <Card.Content>
          <View style={styles.cardRow}>
            <Avatar name={item.full_name} size="md" />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.full_name}</Text>
              <View style={[
                styles.roleBadge, 
                { backgroundColor: item.role === 'admin' ? colors.primaryTint : colors.backgroundSecondary }
              ]}>
                <Text style={[
                  styles.roleText, 
                  { color: item.role === 'admin' ? colors.primaryDark : colors.textSecondary }
                ]}>
                  {item.role}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleRoleToggle(item)} style={styles.actionButton}>
              <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </MotiView>
  );

  return (
    <Container safeArea padding="lg" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <Text style={styles.subtitle}>Manage laboratory access and roles.</Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            colors={[colors.primary]} 
          />
        }
        contentContainerStyle={styles.listContent}
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
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  roleText: {
    ...typography.tiny,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  actionButton: {
    padding: spacing.sm,
    backgroundColor: colors.primaryTint,
    borderRadius: borderRadius.md,
  },
});
