import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { BluetoothService } from '../services/BluetoothService';

export const BluetoothScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [bluetoothService] = useState(() => new BluetoothService());

  const startScan = async () => {
    try {
      setScanning(true);
      await bluetoothService.initialize();
      const foundDevices = await bluetoothService.scanForDevices(10000);
      setDevices(foundDevices);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to scan for devices';
      Alert.alert('Bluetooth Error', errorMessage);
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bluetooth Pay</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>⚡</Text>
          <Text style={styles.infoTitle}>Offline Payments</Text>
          <Text style={styles.infoText}>
            Send payments via Bluetooth when you don't have internet. Transactions are cryptographically signed and sync when you're back online.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
          onPress={startScan}
          disabled={scanning}
        >
          {scanning ? (
            <>
              <ActivityIndicator color="#000" />
              <Text style={styles.scanButtonText}>Scanning...</Text>
            </>
          ) : (
            <Text style={styles.scanButtonText}>🔍 Scan for Devices</Text>
          )}
        </TouchableOpacity>

        <ScrollView style={styles.deviceList}>
          {devices.length === 0 && !scanning && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No devices found</Text>
              <Text style={styles.emptyStateSubtext}>
                Make sure Bluetooth is enabled and the recipient's device is nearby
              </Text>
            </View>
          )}

          {devices.map((device, index) => (
            <TouchableOpacity key={index} style={styles.deviceCard}>
              <View style={styles.deviceIcon}>
                <Text style={styles.deviceIconText}>📱</Text>
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name || 'Unknown Device'}</Text>
                <Text style={styles.deviceId}>{device.id}</Text>
              </View>
              <View style={styles.deviceArrow}>
                <Text style={styles.deviceArrowText}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.howItWorks}>
          <Text style={styles.howItWorksTitle}>How it works</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Scan for nearby devices</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Select recipient and enter amount</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Transaction is signed and sent via Bluetooth</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>Auto-syncs to blockchain when online</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: '#00D4FF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  scanButtonDisabled: {
    opacity: 0.5,
  },
  scanButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deviceList: {
    flex: 1,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceIconText: {
    fontSize: 24,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceId: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  deviceArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceArrowText: {
    color: '#00D4FF',
    fontSize: 18,
  },
  howItWorks: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 20,
  },
  howItWorksTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    color: '#888',
    fontSize: 14,
    flex: 1,
  },
});
