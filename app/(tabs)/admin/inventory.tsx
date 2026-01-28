import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Container, Card, Button, Input } from '@/components/ui';
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

export default function AdminInventory() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'equipment' | 'consumable' | 'tool'>('tool');
  const [quantity, setQuantity] = useState('1');
  const [status, setStatus] = useState<'available' | 'maintenance' | 'out_of_stock'>('available');
  const [condition, setCondition] = useState('New');

  const { data: resources = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Resource[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingId) {
        const { error } = await supabase
          .from('resources')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('resources')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      Alert.alert('Success', `Resource ${editingId ? 'updated' : 'added'} successfully.`);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (error) => {
      console.error('Error saving resource:', error);
      Alert.alert('Error', 'Failed to save resource.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (error) => {
      console.error('Error deleting resource:', error);
      Alert.alert('Error', 'Failed to delete resource.');
    },
  });

  const handleSave = () => {
    if (!name || !description || !quantity) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    saveMutation.mutate({
      name,
      description,
      type,
      quantity: parseInt(quantity),
      status,
      condition,
    });
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Resource',
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id)
        }
      ]
    );
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setType('tool');
    setQuantity('1');
    setStatus('available');
    setCondition('New');
    setEditingId(null);
    setModalVisible(false);
  };

  const startEdit = (resource: Resource) => {
    setName(resource.name);
    setDescription(resource.description);
    setType(resource.type);
    setQuantity(resource.quantity.toString());
    setStatus(resource.status);
    setCondition(resource.condition);
    setEditingId(resource.id);
    setModalVisible(true);
  };

  const renderItem = ({ item, index }: { item: Resource, index: number }) => (
    <Card variant="outline" style={styles.card}>
      <Card.Content>
        <View style={styles.cardRow}>
          <View style={styles.cardInfo}>
            <Text style={styles.resourceName}>{item.name}</Text>
            <Text style={styles.resourceType}>{item.type} • {item.quantity} in stock</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => startEdit(item)} style={styles.actionIcon}>
              <Ionicons name="pencil" size={20} color={colors.info} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionIcon}>
              <Ionicons name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <Container safeArea padding="lg" style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>Manage lab equipment and tools.</Text>
        </View>
        <Button
          variant="primary"
          size="sm"
          onPress={() => setModalVisible(true)}
          leftIcon={<Ionicons name="add" size={20} color={colors.white} />}
        >
          Add
        </Button>
      </View>

      <FlatList
        data={resources}
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
              <Text style={styles.emptyText}>No resources in inventory yet.</Text>
            </View>
          ) : null
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <MotiView
            from={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Resource' : 'Add New Resource'}</Text>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input label="Name" value={name} onChangeText={setName} placeholder="Microscope X1" />
              <View style={{ height: spacing.sm }} />
              <Input 
                label="Description" 
                value={description} 
                onChangeText={setDescription} 
                placeholder="High precision microscope..." 
                multiline
                numberOfLines={3}
              />
              <View style={{ height: spacing.sm }} />
              <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
              <View style={{ height: spacing.sm }} />
              <Input label="Condition" value={condition} onChangeText={setCondition} placeholder="Good / New / Used" />

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Type</Text>
                <View style={styles.typeButtons}>
                  {(['equipment', 'consumable', 'tool'] as const).map((t) => (
                    <Button
                      key={t}
                      variant={type === t ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => setType(t)}
                      style={styles.typeButton}
                    >
                      {t}
                    </Button>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Status</Text>
                <View style={styles.typeButtons}>
                  {(['available', 'maintenance', 'out_of_stock'] as const).map((s) => (
                    <Button
                      key={s}
                      variant={status === s ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => setStatus(s)}
                      style={styles.typeButton}
                    >
                      {s.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </View>
              </View>

              <Button
                variant="primary"
                size="lg"
                onPress={handleSave}
                style={styles.saveButton}
              >
                {editingId ? 'Update' : 'Save'}
              </Button>
            </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  resourceName: {
    ...typography.h4,
    color: colors.text,
  },
  resourceType: {
    ...typography.tiny,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionIcon: {
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  formSection: {
    marginTop: spacing.md,
  },
  formLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
  },
  saveButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
