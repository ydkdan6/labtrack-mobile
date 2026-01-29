import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, Alert, Modal, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Container, Card, Button, Avatar } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';

interface Reservation {
  id: string;
  resource_id: string;
  user_id: string;
  reserved_from: string;
  reserved_until: string;
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
  resource: {
    name: string;
    type: string;
  };
  profile: {
    full_name: string;
  };
}

export default function AdminReservations() {
  const queryClient = useQueryClient();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: reservations = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          resource:resources(name, type),
          profile:profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Reservation[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('reservations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      setModalVisible(false);
      setSelectedReservation(null);
      Alert.alert('Success', 'Reservation status updated.');
    },
    onError: (error) => {
      console.error('Error updating reservation:', error);
      Alert.alert('Error', 'Failed to update reservation status.');
    },
  });

  const handleApprove = (reservation: Reservation) => {
    Alert.alert(
      'Approve Reservation',
      `Approve reservation for ${reservation.resource.name} by ${reservation.profile.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => updateStatusMutation.mutate({ id: reservation.id, status: 'approved' })
        }
      ]
    );
  };

  const handleReject = (reservation: Reservation) => {
    Alert.alert(
      'Cancel Reservation',
      `Cancel reservation for ${reservation.resource.name}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel Reservation',
          style: 'destructive',
          onPress: () => updateStatusMutation.mutate({ id: reservation.id, status: 'cancelled' })
        }
      ]
    );
  };

  const handleComplete = (reservation: Reservation) => {
    updateStatusMutation.mutate({ id: reservation.id, status: 'completed' });
  };

  const openDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'approved': return colors.success;
      case 'cancelled': return colors.error;
      case 'completed': return colors.info;
      default: return colors.textSecondary;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item, index }: { item: Reservation; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 50, type: 'timing' }}
    >
      <Card variant="outline" style={styles.card} onPress={() => openDetails(item)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceName}>{item.resource.name}</Text>
              <View style={styles.userRow}>
                <Avatar name={item.profile.full_name} size="sm" />
                <Text style={styles.userName}>{item.profile.full_name}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>

          <View style={styles.dateInfo}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
              <Text style={styles.dateText}>
                {formatDate(item.reserved_from)} - {formatDate(item.reserved_until)}
              </Text>
            </View>
          </View>

          {item.status === 'pending' && (
            <View style={styles.actionButtons}>
              <Button
                variant="primary"
                size="sm"
                onPress={() => handleApprove(item)}
                style={styles.approveButton}
                leftIcon={<Ionicons name="checkmark" size={16} color={colors.white} />}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => handleReject(item)}
                style={styles.rejectButton}
                leftIcon={<Ionicons name="close" size={16} color={colors.error} />}
              >
                Cancel
              </Button>
            </View>
          )}

          {item.status === 'approved' && (
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleComplete(item)}
              style={styles.completeButton}
              leftIcon={<Ionicons name="checkbox" size={16} color={colors.info} />}
            >
              Mark Complete
            </Button>
          )}
        </Card.Content>
      </Card>
    </MotiView>
  );

  return (
    <Container safeArea padding="lg" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservations</Text>
        <Text style={styles.subtitle}>Manage hardware reservations from users.</Text>
      </View>

      <FlatList
        data={reservations}
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
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No reservations yet.</Text>
            </View>
          ) : null
        }
      />

      {/* Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <MotiView
            from={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reservation Details</Text>
              <Button variant="ghost" size="sm" onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Button>
            </View>

            {selectedReservation && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Card variant="outline" style={styles.detailCard}>
                  <Card.Content>
                    <Text style={styles.detailLabel}>Resource</Text>
                    <Text style={styles.detailValue}>{selectedReservation.resource.name}</Text>
                    <Text style={styles.detailSubValue}>{selectedReservation.resource.type}</Text>
                  </Card.Content>
                </Card>

                <Card variant="outline" style={styles.detailCard}>
                  <Card.Content>
                    <Text style={styles.detailLabel}>Reserved By</Text>
                    <View style={styles.userDetailRow}>
                      <Avatar name={selectedReservation.profile.full_name} size="md" />
                      <Text style={styles.detailValue}>{selectedReservation.profile.full_name}</Text>
                    </View>
                  </Card.Content>
                </Card>

                <Card variant="outline" style={styles.detailCard}>
                  <Card.Content>
                    <Text style={styles.detailLabel}>Reservation Period</Text>
                    <Text style={styles.detailValue}>
                      From: {formatDate(selectedReservation.reserved_from)}
                    </Text>
                    <Text style={styles.detailValue}>
                      Until: {formatDate(selectedReservation.reserved_until)}
                    </Text>
                  </Card.Content>
                </Card>

                {selectedReservation.notes && (
                  <Card variant="outline" style={styles.detailCard}>
                    <Card.Content>
                      <Text style={styles.detailLabel}>Notes</Text>
                      <Text style={styles.detailValue}>{selectedReservation.notes}</Text>
                    </Card.Content>
                  </Card>
                )}

                <View style={styles.statusSection}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[
                    styles.statusBadgeLarge, 
                    { backgroundColor: getStatusColor(selectedReservation.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusTextLarge, 
                      { color: getStatusColor(selectedReservation.status) }
                    ]}>
                      {selectedReservation.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </MotiView>
        </View>
      </Modal>
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
  },
  resourceInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  resourceName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userName: {
    ...typography.caption,
    color: colors.textSecondary,
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
  dateInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    ...typography.small,
    color: colors.textTertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  approveButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
    borderColor: colors.error,
  },
  completeButton: {
    marginTop: spacing.md,
    borderColor: colors.info,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  detailCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  detailLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
  },
  detailSubValue: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'capitalize',
  },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusSection: {
    marginTop: spacing.md,
  },
  statusBadgeLarge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  statusTextLarge: {
    ...typography.bodyBold,
    textTransform: 'uppercase',
  },
});
