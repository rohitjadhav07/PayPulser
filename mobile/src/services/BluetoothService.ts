import { BleManager, Device, State, Characteristic } from 'react-native-ble-plx';
import { OfflineTransaction } from '../types';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';

// PayPulse BLE Protocol UUIDs
const PAYPULSE_SERVICE_UUID = '00001234-0000-1000-8000-00805f9b34fb';
const TX_SEND_CHARACTERISTIC = '00001235-0000-1000-8000-00805f9b34fb';
const TX_ACK_CHARACTERISTIC = '00001236-0000-1000-8000-00805f9b34fb';
const WALLET_ADDRESS_CHARACTERISTIC = '00001237-0000-1000-8000-00805f9b34fb';

interface BLETransaction {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
  nonce: string;
  signature: string;
  version: string;
}

interface TransactionAck {
  txId: string;
  status: 'accepted' | 'rejected';
  reason?: string;
  recipientSignature: string;
}

export class BluetoothService {
  private manager: BleManager | null = null;
  private initialized: boolean = false;
  private isAdvertising: boolean = false;
  private connectedDevices: Map<string, Device> = new Map();
  private pendingTransactions: Map<string, BLETransaction> = new Map();
  private onTransactionReceivedCallback?: (tx: BLETransaction) => void;
  private onAckReceivedCallback?: (ack: TransactionAck) => void;

  constructor() {
    // Lazy initialization
  }

  private getManager(): BleManager {
    if (!this.manager) {
      try {
        this.manager = new BleManager();
        console.log('✅ BleManager created successfully');
      } catch (error) {
        console.error('❌ Failed to create BleManager:', error);
        throw new Error('Bluetooth is not available on this device. Make sure you are using a physical device, not an emulator.');
      }
    }
    return this.manager;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('✅ Bluetooth already initialized');
      return;
    }
    
    try {
      console.log('🔄 Initializing Bluetooth...');
      const manager = this.getManager();
      
      // Check Bluetooth state
      const state = await manager.state();
      console.log('📡 Bluetooth state:', state);
      
      if (state === State.PoweredOff) {
        throw new Error('Bluetooth is turned off. Please enable Bluetooth in your device settings.');
      }
      
      if (state === State.Unauthorized) {
        throw new Error('Bluetooth permission denied. Please grant Bluetooth permission in app settings.');
      }
      
      if (state === State.Unsupported) {
        throw new Error('Bluetooth is not supported on this device.');
      }
      
      if (state !== State.PoweredOn) {
        console.warn('⚠️ Bluetooth state is:', state);
        // Still mark as initialized but warn user
      }
      
      this.initialized = true;
      console.log('✅ Bluetooth initialized successfully');
    } catch (error) {
      console.error('❌ Bluetooth initialization failed:', error);
      throw error;
    }
  }

  // ==================== PERIPHERAL MODE (RECEIVER) ====================
  
  async startAdvertising(walletAddress: string): Promise<void> {
    await this.initialize();
    
    if (this.isAdvertising) {
      console.log('Already advertising');
      return;
    }

    try {
      // Note: React Native BLE PLX doesn't support peripheral mode directly
      // In production, you'd need to use native modules or expo-bluetooth
      // This is a conceptual implementation
      
      console.log(`📡 Starting to advertise wallet: ${walletAddress.substring(0, 8)}...`);
      this.isAdvertising = true;
      
      // Store wallet address for when devices connect
      this.setupCharacteristicListeners(walletAddress);
      
    } catch (error) {
      console.error('Failed to start advertising:', error);
      throw error;
    }
  }

  async stopAdvertising(): Promise<void> {
    if (!this.isAdvertising) return;
    
    console.log('📡 Stopping advertisement');
    this.isAdvertising = false;
  }

  private setupCharacteristicListeners(walletAddress: string): void {
    // In production, this would set up BLE characteristics
    // that other devices can read/write to
    console.log('Setting up BLE characteristics for receiving transactions');
  }

  onTransactionReceived(callback: (tx: BLETransaction) => void): void {
    this.onTransactionReceivedCallback = callback;
  }

  onAckReceived(callback: (ack: TransactionAck) => void): void {
    this.onAckReceivedCallback = callback;
  }

  // ==================== CENTRAL MODE (SENDER) ====================
  
  async scanForPayPulseDevices(timeout: number = 10000): Promise<Device[]> {
    await this.initialize();
    
    const manager = this.getManager();
    const devices: Device[] = [];
    
    console.log('🔍 Scanning for PayPulse devices...');
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        manager.stopDeviceScan();
        console.log(`✅ Scan complete. Found ${devices.length} devices`);
        resolve(devices);
      }, timeout);

      manager.startDeviceScan(
        [PAYPULSE_SERVICE_UUID], // Only scan for PayPulse devices
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            clearTimeout(timer);
            manager.stopDeviceScan();
            console.error('Scan error:', error);
            reject(error);
            return;
          }

          if (device && !devices.find(d => d.id === device.id)) {
            console.log(`📱 Found device: ${device.name || device.id}`);
            devices.push(device);
          }
        }
      );
    });
  }

  async scanForDevices(timeout: number = 10000): Promise<Device[]> {
    // Fallback to scan all devices (for demo purposes)
    await this.initialize();
    
    const manager = this.getManager();
    const devices: Device[] = [];
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        manager.stopDeviceScan();
        resolve(devices);
      }, timeout);

      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          clearTimeout(timer);
          manager.stopDeviceScan();
          reject(error);
          return;
        }

        if (device && !devices.find(d => d.id === device.id)) {
          devices.push(device);
        }
      });
    });
  }

  async connectToDevice(device: Device): Promise<Device> {
    console.log(`🔗 Connecting to ${device.name || device.id}...`);
    
    try {
      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      this.connectedDevices.set(device.id, connectedDevice);
      console.log('✅ Connected successfully');
      
      return connectedDevice;
    } catch (error) {
      console.error('Connection failed:', error);
      throw new Error('Failed to connect to device');
    }
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (device) {
      await device.cancelConnection();
      this.connectedDevices.delete(deviceId);
      console.log('🔌 Disconnected from device');
    }
  }

  async getWalletAddress(device: Device): Promise<string | null> {
    try {
      const characteristic = await device.readCharacteristicForService(
        PAYPULSE_SERVICE_UUID,
        WALLET_ADDRESS_CHARACTERISTIC
      );
      
      if (characteristic.value) {
        const walletAddress = Buffer.from(characteristic.value, 'base64').toString('utf-8');
        console.log(`💼 Retrieved wallet address: ${walletAddress.substring(0, 8)}...`);
        return walletAddress;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to read wallet address:', error);
      return null;
    }
  }

  // ==================== TRANSACTION PROTOCOL ====================
  
  async sendTransaction(
    device: Device,
    transaction: OfflineTransaction
  ): Promise<{ success: boolean; ack?: TransactionAck; error?: string }> {
    try {
      console.log(`💸 Sending transaction ${transaction.id}...`);
      
      // Step 1: Ensure device is connected
      let connectedDevice = this.connectedDevices.get(device.id);
      if (!connectedDevice) {
        connectedDevice = await this.connectToDevice(device);
      }

      // Step 2: Prepare transaction data
      const bleTransaction: BLETransaction = {
        id: transaction.id,
        sender: transaction.sender,
        recipient: transaction.recipient,
        amount: transaction.amount,
        timestamp: transaction.timestamp,
        nonce: transaction.nonce,
        signature: transaction.signature,
        version: '1.0.0'
      };

      const txData = JSON.stringify(bleTransaction);
      const base64Data = Buffer.from(txData).toString('base64');

      // Step 3: Send transaction via BLE
      await connectedDevice.writeCharacteristicWithResponseForService(
        PAYPULSE_SERVICE_UUID,
        TX_SEND_CHARACTERISTIC,
        base64Data
      );

      console.log('📤 Transaction sent, waiting for acknowledgment...');
      
      // Step 4: Wait for acknowledgment
      const ack = await this.waitForAcknowledgment(connectedDevice, transaction.id);
      
      if (ack.status === 'accepted') {
        console.log('✅ Transaction accepted by recipient');
        return { success: true, ack };
      } else {
        console.log('❌ Transaction rejected:', ack.reason);
        return { success: false, ack, error: ack.reason };
      }

    } catch (error) {
      console.error('Transaction send failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  private async waitForAcknowledgment(
    device: Device,
    txId: string,
    timeout: number = 10000
  ): Promise<TransactionAck> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Acknowledgment timeout'));
      }, timeout);

      // Monitor ACK characteristic
      device.monitorCharacteristicForService(
        PAYPULSE_SERVICE_UUID,
        TX_ACK_CHARACTERISTIC,
        (error, characteristic) => {
          if (error) {
            clearTimeout(timer);
            reject(error);
            return;
          }

          if (characteristic?.value) {
            try {
              const ackData = Buffer.from(characteristic.value, 'base64').toString('utf-8');
              const ack: TransactionAck = JSON.parse(ackData);
              
              if (ack.txId === txId) {
                clearTimeout(timer);
                resolve(ack);
              }
            } catch (e) {
              console.error('Failed to parse ACK:', e);
            }
          }
        }
      );
    });
  }

  async receiveTransaction(characteristicValue: string): Promise<BLETransaction> {
    try {
      const txData = Buffer.from(characteristicValue, 'base64').toString('utf-8');
      const transaction: BLETransaction = JSON.parse(txData);
      
      console.log(`📥 Received transaction ${transaction.id}`);
      
      // Verify signature
      const isValid = this.verifyBLETransaction(transaction);
      
      if (!isValid) {
        throw new Error('Invalid transaction signature');
      }
      
      // Notify callback
      if (this.onTransactionReceivedCallback) {
        this.onTransactionReceivedCallback(transaction);
      }
      
      return transaction;
    } catch (error) {
      console.error('Failed to receive transaction:', error);
      throw error;
    }
  }

  async sendAcknowledgment(
    device: Device,
    txId: string,
    status: 'accepted' | 'rejected',
    recipientPrivateKey: string,
    reason?: string
  ): Promise<void> {
    try {
      // Sign the acknowledgment
      const ackMessage = `${txId}:${status}`;
      const messageBytes = Buffer.from(ackMessage);
      const secretKeyBytes = bs58.decode(recipientPrivateKey);
      const signature = nacl.sign.detached(messageBytes, secretKeyBytes);

      const ack: TransactionAck = {
        txId,
        status,
        reason,
        recipientSignature: bs58.encode(signature)
      };

      const ackData = JSON.stringify(ack);
      const base64Data = Buffer.from(ackData).toString('base64');

      await device.writeCharacteristicWithResponseForService(
        PAYPULSE_SERVICE_UUID,
        TX_ACK_CHARACTERISTIC,
        base64Data
      );

      console.log(`✅ Sent ${status} acknowledgment for ${txId}`);
    } catch (error) {
      console.error('Failed to send acknowledgment:', error);
      throw error;
    }
  }

  async startAdvertising(publicKey: string): Promise<void> {
    // In production, implement BLE peripheral mode to advertise wallet address
    console.log('Advertising wallet:', publicKey);
  }

  async stopAdvertising(): Promise<void> {
    console.log('Stopped advertising');
  }

  // ==================== CRYPTOGRAPHIC OPERATIONS ====================
  
  signTransaction(
    transaction: Omit<OfflineTransaction, 'signature'>,
    secretKey: string
  ): OfflineTransaction {
    const message = JSON.stringify({
      sender: transaction.sender,
      recipient: transaction.recipient,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      nonce: transaction.nonce
    });

    const messageBytes = Buffer.from(message);
    const secretKeyBytes = bs58.decode(secretKey);
    const signature = nacl.sign.detached(messageBytes, secretKeyBytes);

    console.log('🔐 Transaction signed');
    
    return {
      ...transaction,
      signature: bs58.encode(signature)
    };
  }

  verifyTransaction(transaction: OfflineTransaction): boolean {
    try {
      const { signature, ...data } = transaction;
      const message = JSON.stringify({
        sender: data.sender,
        recipient: data.recipient,
        amount: data.amount,
        timestamp: data.timestamp,
        nonce: data.nonce
      });

      const messageBytes = Buffer.from(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = bs58.decode(data.sender);

      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
      
      if (isValid) {
        console.log('✅ Transaction signature valid');
      } else {
        console.log('❌ Transaction signature invalid');
      }
      
      return isValid;
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  }

  private verifyBLETransaction(transaction: BLETransaction): boolean {
    try {
      const { signature, ...data } = transaction;
      const message = JSON.stringify({
        sender: data.sender,
        recipient: data.recipient,
        amount: data.amount,
        timestamp: data.timestamp,
        nonce: data.nonce
      });

      const messageBytes = Buffer.from(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = bs58.decode(data.sender);

      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch (error) {
      console.error('BLE transaction verification failed:', error);
      return false;
    }
  }

  verifyAcknowledgment(ack: TransactionAck, recipientPublicKey: string): boolean {
    try {
      const message = `${ack.txId}:${ack.status}`;
      const messageBytes = Buffer.from(message);
      const signatureBytes = bs58.decode(ack.recipientSignature);
      const publicKeyBytes = bs58.decode(recipientPublicKey);

      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch (error) {
      console.error('ACK verification failed:', error);
      return false;
    }
  }

  // ==================== UTILITY METHODS ====================
  
  getPendingTransaction(txId: string): BLETransaction | undefined {
    return this.pendingTransactions.get(txId);
  }

  addPendingTransaction(tx: BLETransaction): void {
    this.pendingTransactions.set(tx.id, tx);
    console.log(`📝 Added pending transaction: ${tx.id}`);
  }

  removePendingTransaction(txId: string): void {
    this.pendingTransactions.delete(txId);
    console.log(`🗑️ Removed pending transaction: ${txId}`);
  }

  getPendingTransactions(): BLETransaction[] {
    return Array.from(this.pendingTransactions.values());
  }

  isAdvertising(): boolean {
    return this.isAdvertising;
  }

  getConnectedDevices(): Device[] {
    return Array.from(this.connectedDevices.values());
  }

  destroy(): void {
    if (this.manager) {
      try {
        this.manager.destroy();
        this.manager = null;
        this.initialized = false;
      } catch (error) {
        console.error('Error destroying BLE Manager:', error);
      }
    }
  }

  isAvailable(): boolean {
    try {
      return this.manager !== null || typeof BleManager !== 'undefined';
    } catch {
      return false;
    }
  }
}
