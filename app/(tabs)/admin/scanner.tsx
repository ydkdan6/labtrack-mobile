import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, ScrollView, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Container, Card, Button } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';

interface Resource {
  id: string;
  name: string;
  description: string;
  type: string;
  quantity: number;
  status: string;
  condition: string;
  specs: string | null;
  manual_url: string | null;
  deployment_location: string | null;
  qr_code: string | null;
}

export default function AdminScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: resource, isLoading, refetch } = useQuery({
    queryKey: ['scanned-resource', scannedData],
    queryFn: async () => {
      if (!scannedData) return null;
      
      // Try to find by QR code or ID
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .or(`qr_code.eq.${scannedData},id.eq.${scannedData}`)
        .single();

      if (error) {
        console.error('Resource not found:', error);
        return null;
      }
      return data as Resource;
    },
    enabled: !!scannedData,
  });

  useEffect(() => {
    if (resource) {
      setModalVisible(true);
    } else if (scannedData && !isLoading) {
      Alert.alert('Not Found', 'No resource found with this QR code.');
      resetScanner();
    }
  }, [resource, isLoading, scannedData]);

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanning) {
      setScanning(false);
      setScannedData(data);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setModalVisible(false);
    setScanning(true);
  };

  // Handle web platform where camera may not be available
  if (Platform.OS === 'web') {
    return (
      <Container safeArea padding="lg" style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="camera-off" size={80} color={colors.textTertiary} />
          <Text style={styles.permissionText}>
            QR Scanner is only available on mobile devices.
          </Text>
          <Text style={styles.permissionSubtext}>
            Use the Expo Go app on iOS or Android to scan QR codes.
          </Text>
        </View>
      </Container>
    );
  }

  if (!permission) {
    return (
      <Container safeArea padding="lg" style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.permissionText}>Loading camera permissions...</Text>
        </View>
      </Container>
    );
  }

  if (!permission.granted) {
    return (
      <Container safeArea padding="lg" style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="camera-off" size={80} color={colors.textTertiary} />
          <Text style={styles.permissionText}>Camera permission is required to scan QR codes.</Text>
          <Button variant="primary" onPress={requestPermission} style={styles.permissionButton}>
            Grant Permission
          </Button>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QR Scanner</Text>
        <Text style={styles.subtitle}>Scan hardware tags to view specs and manuals.</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'code128', 'code39'],
          }}
          onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanText}>
              {scanning ? 'Position QR code within the frame' : 'Processing...'}
            </Text>
          </View>
        </CameraView>
      </View>

      {!scanning && (
        <Button variant="outline" onPress={resetScanner} style={styles.scanAgainButton}>
          Scan Again
        </Button>
      )}

      {/* Resource Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetScanner}
      >
        <View style={styles.modalOverlay}>
          <MotiView
            from={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hardware Details</Text>
              <Button variant="ghost" size="sm" onPress={resetScanner}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Button>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {resource && (
                <>
                  <View style={styles.resourceHeader}>
                    <Ionicons 
                      name={resource.type === 'equipment' ? 'hardware-chip' : 'construct'} 
                      size={48} 
                      color={colors.primary} 
                    />
                    <View style={styles.resourceHeaderInfo}>
                      <Text style={styles.resourceName}>{resource.name}</Text>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{resource.type}</Text>
                      </View>
                    </View>
                  </View>

                  <Card variant="outline" style={styles.detailCard}>
                    <Card.Content>
                      <Text style={styles.sectionTitle}>Description</Text>
                      <Text style={styles.sectionContent}>{resource.description}</Text>
                    </Card.Content>
                  </Card>

                  <Card variant="outline" style={styles.detailCard}>
                    <Card.Content>
                      <Text style={styles.sectionTitle}>Status</Text>
                      <View style={styles.statusRow}>
                        <View style={styles.statusItem}>
                          <Ionicons name="checkmark-circle" size={20} color={resource.status === 'available' ? colors.success : colors.warning} />
                          <Text style={styles.statusLabel}>{resource.status}</Text>
                        </View>
                        <View style={styles.statusItem}>
                          <Ionicons name="cube" size={20} color={colors.info} />
                          <Text style={styles.statusLabel}>Qty: {resource.quantity}</Text>
                        </View>
                        <View style={styles.statusItem}>
                          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                          <Text style={styles.statusLabel}>{resource.condition}</Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>

                  {resource.deployment_location && (
                    <Card variant="outline" style={styles.detailCard}>
                      <Card.Content>
                        <Text style={styles.sectionTitle}>
                          <Ionicons name="location" size={16} color={colors.primary} /> Deployment Location
                        </Text>
                        <Text style={styles.sectionContent}>{resource.deployment_location}</Text>
                      </Card.Content>
                    </Card>
                  )}

                  {resource.specs && (
                    <Card variant="outline" style={styles.detailCard}>
                      <Card.Content>
                        <Text style={styles.sectionTitle}>
                          <Ionicons name="settings" size={16} color={colors.primary} /> Technical Specifications
                        </Text>
                        <Text style={styles.sectionContent}>{resource.specs}</Text>
                      </Card.Content>
                    </Card>
                  )}

                  {resource.manual_url && (
                    <Card variant="outline" style={styles.detailCard}>
                      <Card.Content>
                        <Text style={styles.sectionTitle}>
                          <Ionicons name="document-text" size={16} color={colors.primary} /> Manual
                        </Text>
                        <Text style={styles.manualUrl}>{resource.manual_url}</Text>
                      </Card.Content>
                    </Card>
                  )}
                </>
              )}
            </ScrollView>

            <Button variant="primary" onPress={resetScanner} style={styles.closeButton}>
              Close & Scan Another
            </Button>
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
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.primaryDark,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanText: {
    ...typography.body,
    color: colors.white,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  permissionSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  permissionButton: {
    marginTop: spacing.md,
  },
  scanAgainButton: {
    margin: spacing.lg,
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
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primaryTint,
    borderRadius: borderRadius.lg,
  },
  resourceHeaderInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  resourceName: {
    ...typography.h3,
    color: colors.text,
  },
  typeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  typeText: {
    ...typography.tiny,
    color: colors.white,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  detailCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.text,
    textTransform: 'capitalize',
  },
  manualUrl: {
    ...typography.caption,
    color: colors.info,
    textDecorationLine: 'underline',
  },
  closeButton: {
    marginTop: spacing.lg,
  },
});
