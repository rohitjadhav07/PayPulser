import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, TextInput } from 'react-native';
import { BluetoothService } from '../services/BluetoothService';
import { StorageService } from '../services/StorageService';
import { BiometricService } from '../services/BiometricService';
import { NotificationService } from '../services/NotificationService';
import { Device } from 'react-native-ble-plx';
import { v4 as uuidv4 } from 'uuid';

interface BluetoothPaymentScreenProps {
  onBack: () => void;
}

export const BluetoothPaymentScreen: React.FC<BluetoothPaymentScreenProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'send' | 'receive'>('send');
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const bluetooth = new BluetoothService();
  const storage = new StorageService();
  const biometric = new BiometricService();
  const notifications = NotificationService.getInstance();

  useEffect(() => {
    loadWallet();
    setupListeners();
    
    return () => {
      if (isAdvertising) {
        bluetooth.stopAdvertising();
      }
    };
  }, []);

  const loadWallet = async () => {
    const wallet = await storage.getWallet();
    if (wallet) {
      setWalletAddress(wallet.publicKey);
    }
  };

  const setupListeners = () => {
    // Listen for incoming transactions
    bluetooth.onTransactionReceived(async (tx) => {
      // Send push notification
      await notifications.notifyBluetoothPaymentRequest(tx.amount, tx.sender);
      
      Alert.alert(
        '💰 Payment Received',
        `Amount: ${tx.amount} SOL\nFrom: ${tx.sender.substring(0, 8)}...\n\nAccept this payment?`,
        [
          {
            text: 'Reject',
            style: 'cancel',
            onPress: () => handleRejectTransaction(tx.id)
          },
          {
            text: 'Accept',
            onPress: () => handleAcceptTransaction(tx)
          }
        ]
      );
    });

    // Listen for acknowledgments
    bluetooth.onAckReceived((ack) => {
      if (ack.status === 'accepted') {
        Alert.alert('✅ Payment Accepted', 'The recipient has accepted your payment!');
      } else {
        Alert.alert('❌ Payment Rejected', ack.reason || 'The recipient rejected your payment');
      }
    });
  };

  const handleAcceptTransaction = async (tx: any) => {
    try {
      // Save to pending transactions
      await storage.saveOfflineTransaction(tx);
      
      // Send notification
      await notifications.notifyPaymentReceived(tx.amount, tx.sender);
      
      Alert.alert('Success', 'Payment accepted and will sync when online');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept payment');
    }
  };

  const handleRejectTransaction = async (txId: string) => {
    Alert.alert('Rejected', 'Payment was rejected');
  };

  const toggleAdvertising = async () => {
    try {
      if (isAdvertising) {
        await bluetooth.stopAdvertising();
        setIsAdvertising(false);
        Alert.alert('Stopped', 'No longer accepting payments');
      } else {
        // Initialize first
        await bluetooth.initialize();
        await bluetooth.startAdvertising(walletAddress);
        setIsAdvertising(true);
        Alert.alert('Ready', 'Now accepting Bluetooth payments!');
      }
    } catch (error) {
      console.error('Advertising error:', error);
      Alert.alert(
        'Bluetooth Error',
        (error as Error).message + '\n\nNote: Bluetooth requires a physical device. Emulators are not supported.'
      );
    }
  };

  const startScan = async () => {
    try {
      setScanning(true);
      setDevices([]);
      
      await bluetooth.initialize();
      const foundDevices = await bluetooth.scanForPayPulseDevices(10000);
      
      setDevices(foundDevices);
      
      if (foundDevices.length === 0) {
        Alert.alert('No Devices', 'No PayPulse devices found nearby');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setScanning(false);
    }
  };

  const selectDevice = async (device: Device) => {
    try {
      setSelectedDevice(device);
      
      // Try to get wallet address from device
      const address = await bluetooth.getWalletAddress(device);
      if (address) {
        Alert.alert('Device Found', `Wallet: ${address.substring(0, 8)}...`);
      }
    } catch (error) {
      console.error('Failed to select device:', error);
    }
  };

  const sendPayment = async () => {
    if (!selectedDevice || !amount) {
      Alert.alert('Error', 'Please select a device and enter amount');
      return;
    }

    const wallet = await storage.getWallet();
    if (!wallet) {
      Alert.alert('Error', 'Wallet not found');
      return;
    }

    // Biometric authentication
    const biometricAvailable = await biometric.isAvailable();
    if (biometricAvailable) {
      const authenticated = await biometric.authenticateForPayment(parseFloat(amount));
      if (!authenticated) {
        Alert.alert('Authentication Failed', 'Payment cancelled');
        return;
      }
    }

    try {
      setSending(true);

      // Create transaction
      const transaction = {
        id: uuidv4(),
        sender: wallet.publicKey,
        recipient: selectedDevice.id, // In production, use actual wallet address
        amount: parseFloat(amount),
        timestamp: Date.now(),
        nonce: uuidv4()
      };

      // Sign transaction
      const signedTx = bluetooth.signTransaction(transaction, wallet.encryptedPrivateKey);

      // Send via Bluetooth
      const result = await bluetooth.sendTransaction(selectedDevice, signedTx);

      if (result.success) {
        // Save to pending
        await storage.saveOfflineTransaction(signedTx);
        
        Alert.alert('✅ Payment Sent', 'Payment sent successfully and will sync when online');
        setAmount('');
        setSelectedDevice(null);
      } else {
        Alert.alert('❌ Payment Failed', result.error || 'Failed to send payment');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setSending(false);
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

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'send' && styles.modeButtonActive]}
          onPress={() => setMode('send')}
        >
          <Text style={[styles.modeButtonText, mode === 'send' && styles.modeButtonTextActive]}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'receive' && styles.modeButtonActive]}
          onPress={() => setMode('receive')}
        >
          <Text style={[styles.modeButtonText, mode === 'receive' && styles.modeButtonTextActive]}>
            Receive
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {mode === 'receive' ? (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📡 Receive Payments</Text>
              <Text style={styles.cardText}>
                Enable advertising to allow nearby devices to send you payments via Bluetooth.
              </Text>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {isAdvertising ? '🟢 Accepting Payments' : '⚫ Not Accepting'}
                </Text>
                <Switch
                  value={isAdvertising}
                  onValueChange={toggleAdvertising}
                  trackColor={{ false: '#222', true: '#14F195' }}
                  thumbColor="#fff"
                />
              </View>

              {isAdvertising && (
                <View style={styles.statusCard}>
                  <Text style={styles.statusText}>✅ Ready to receive payments</Text>
                  <Text style={styles.statusSubtext}>
                    Your wallet: {walletAddress.substring(0, 12)}...
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>How it works</Text>
              <Text style={styles.infoText}>
                • Enable advertising above{'\n'}
                • Sender scans for your device{'\n'}
                • You'll get a notification to accept/reject{'\n'}
                • Payment syncs when you're online
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📤 Send Payment</Text>
              
              <TouchableOpacity
                style={styles.scanButton}
                onPress={startScan}
                disabled={scanning}
              >
                <Text style={styles.scanButtonText}>
                  {scanning ? '🔍 Scanning...' : '🔍 Scan for Devices'}
                </Text>
              </TouchableOpacity>

              {devices.length > 0 && (
                <View style={styles.deviceList}>
                  <Text style={styles.deviceListTitle}>Found Devices:</Text>
                  {devices.map((device) => (
                    <TouchableOpacity
                      key={device.id}
                      style={[
                        styles.deviceItem,
                        selectedDevice?.id === device.id && styles.deviceItemSelected
                      ]}
                      onPress={() => selectDevice(device)}
                    >
                      <Text style={styles.deviceName}>
                        {device.name || 'Unknown Device'}
                      </Text>
                      <Text style={styles.deviceId}>{device.id.substring(0, 12)}...</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedDevice && (
                <View style={styles.paymentForm}>
                  <Text style={styles.inputLabel}>Amount (SOL)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="#666"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                  />

                  <TouchableOpacity
                    style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                    onPress={sendPayment}
                    disabled={sending}
                  >
                    <Text style={styles.sendButtonText}>
                      {sending ? 'Sending...' : '💸 Send Payment'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
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
  modeSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#14F195',
  },
  modeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 241, 149, 0.3)',
  },
  statusText: {
    color: '#14F195',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusSubtext: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  scanButton: {
    backgroundColor: '#14F195',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  scanButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceList: {
    marginTop: 8,
  },
  deviceListTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '600',
  },
  deviceItem: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  deviceItemSelected: {
    borderColor: '#14F195',
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
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
  paymentForm: {
    marginTop: 20,
  },
  inputLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  sendButton: {
    backgroundColor: '#9945FF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
  },
  infoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 24,
  },
});
