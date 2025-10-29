# 🏗️ PayPulse - Technical Architecture

## Overview

PayPulse is an offline-first Solana payment application built with React Native and Expo. It uses a service-oriented architecture with clear separation of concerns.

---

## Tech Stack

### Frontend
- **React Native** 0.81.5
- **Expo** SDK 54
- **TypeScript** 5.3.0
- **React** 19.1.0

### Blockchain
- **@solana/web3.js** 1.95.0
- **Solana Testnet/Devnet/Mainnet**

### Cryptography
- **tweetnacl** 1.0.3 (Ed25519 signatures)
- **bs58** 5.0.0 (Base58 encoding)

### Storage
- **expo-secure-store** (encrypted key storage)
- **@react-native-async-storage/async-storage** (app data)

### Communication
- **react-native-ble-plx** 3.2.0 (Bluetooth Low Energy)
- **WebSocket** (real-time Solana updates)

### UI/UX
- **expo-linear-gradient** (gradients)
- **react-native-svg** (icons)
- **react-native-qrcode-svg** (QR codes)
- **expo-camera** (QR scanning)

### Security & Auth
- **expo-local-authentication** (biometric)
- **expo-notifications** (push notifications)

---

## Architecture Layers

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Screens, Components, Navigation)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           Business Logic Layer          │
│         (Services, State Mgmt)          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│            Data Layer                   │
│  (Storage, Blockchain, Bluetooth)       │
└─────────────────────────────────────────┘
```

---

## Service Architecture

### Core Services

#### 1. **SolanaService**
**Purpose**: Blockchain interaction
**Responsibilities**:
- Wallet creation
- Balance queries
- Transaction submission
- Transaction confirmation
- Real-time balance subscriptions
- Recent transaction fetching

**Key Methods**:
```typescript
createWallet(): Promise<{publicKey, secretKey}>
getBalance(publicKey): Promise<number>
sendTransaction(secretKey, recipient, amount): Promise<signature>
confirmTransaction(signature): Promise<boolean>
subscribeToBalance(publicKey, callback): UnsubscribeFn
getRecentTransactions(publicKey): Promise<Transaction[]>
```

#### 2. **BluetoothService**
**Purpose**: Offline P2P payments
**Responsibilities**:
- BLE device scanning
- Device advertising
- Transaction transmission
- Signature verification
- Acknowledgment handling

**Key Methods**:
```typescript
initialize(): Promise<void>
scanForPayPulseDevices(timeout): Promise<Device[]>
startAdvertising(walletAddress): Promise<void>
sendTransaction(device, signedTx): Promise<Result>
signTransaction(tx, secretKey): SignedTransaction
verifyTransaction(signedTx): boolean
```

#### 3. **PaymentService**
**Purpose**: Unified payment handling
**Responsibilities**:
- Online/offline payment routing
- Transaction queuing
- Auto-sync management
- Error handling

**Key Methods**:
```typescript
sendPayment(recipient, amount, secretKey): Promise<Result>
syncOfflineTransactions(): Promise<number>
startAutoSync(): Promise<void>
```

#### 4. **StorageService**
**Purpose**: Data persistence
**Responsibilities**:
- Wallet storage (encrypted)
- Transaction history
- Offline transaction queue
- App settings

**Key Methods**:
```typescript
saveWallet(publicKey, secretKey): Promise<void>
getWallet(): Promise<Wallet>
saveOfflineTransaction(tx): Promise<void>
getOfflineTransactions(): Promise<Transaction[]>
setItem(key, value): Promise<void>
getItem(key): Promise<string>
```

#### 5. **NotificationService** (Singleton)
**Purpose**: Push notifications
**Responsibilities**:
- Permission management
- Notification scheduling
- Event notifications

**Key Methods**:
```typescript
requestPermissions(): Promise<boolean>
notifyPaymentReceived(amount, sender): Promise<void>
notifyPaymentSent(amount, recipient): Promise<void>
notifyTransactionConfirmed(txHash): Promise<void>
notifySyncComplete(count): Promise<void>
```

#### 6. **BiometricService**
**Purpose**: Biometric authentication
**Responsibilities**:
- Device capability check
- Authentication prompts
- Secure operation gating

**Key Methods**:
```typescript
isAvailable(): Promise<boolean>
getSupportedTypes(): Promise<string[]>
authenticate(reason): Promise<boolean>
authenticateForPayment(amount): Promise<boolean>
authenticateForExport(): Promise<boolean>
```

#### 7. **ErrorRecoveryService** (Singleton)
**Purpose**: Error handling and recovery
**Responsibilities**:
- Failed transaction tracking
- Auto-retry with backoff
- User-friendly error messages
- App state recovery

**Key Methods**:
```typescript
handleTransactionError(id, tx, error): Promise<void>
retryAllFailed(): Promise<void>
getUserFriendlyError(error): string
handleBluetoothError(error): Promise<string>
recoverAppState(): Promise<void>
```

---

## Screen Architecture

### Navigation Flow

```
App.tsx
  ├─ OnboardingScreen (first time)
  └─ HomeScreen
      ├─ WalletScreen (default)
      ├─ SendScreen
      ├─ ReceiveScreen
      ├─ ScanQRScreen
      ├─ BluetoothPaymentScreen
      ├─ HistoryScreen
      ├─ TransactionDetailsScreen
      ├─ ProfileScreen
      └─ SettingsScreen
```

### Screen Responsibilities

#### **WalletScreen**
- Display balance
- Show wallet address
- Quick actions (Send, Receive, Bluetooth, History)
- Real-time balance updates
- Pull-to-refresh

#### **SendScreen**
- Enter recipient address
- Scan QR code
- Enter amount
- Biometric authentication
- Transaction submission

#### **ReceiveScreen**
- Display QR code
- Show wallet address
- Copy to clipboard
- Share functionality

#### **BluetoothPaymentScreen**
- Send/Receive mode toggle
- Device scanning
- Device advertising
- Payment transmission
- Biometric authentication

#### **HistoryScreen**
- Transaction list
- Filter by status
- Transaction selection
- Empty state

#### **TransactionDetailsScreen**
- Full transaction info
- Status indicators
- Copy functionality
- Solana Explorer link

#### **SettingsScreen**
- Network selection
- Currency preference
- Biometric toggle
- Notification toggle
- Private key export
- Cache management

---

## Data Flow

### Online Payment Flow

```
User Input (SendScreen)
    ↓
Biometric Authentication
    ↓
PaymentService.sendPayment()
    ↓
SolanaService.sendTransaction()
    ↓
Solana Blockchain
    ↓
Transaction Confirmation
    ↓
Notification
    ↓
UI Update
```

### Offline Payment Flow

```
User Input (BluetoothPaymentScreen)
    ↓
Biometric Authentication
    ↓
BluetoothService.scanForDevices()
    ↓
Device Selection
    ↓
Transaction Signing
    ↓
Bluetooth Transmission
    ↓
StorageService.saveOfflineTransaction()
    ↓
[Wait for Online]
    ↓
PaymentService.syncOfflineTransactions()
    ↓
Solana Blockchain
    ↓
Notification
```

### Real-Time Balance Update Flow

```
WalletScreen Mount
    ↓
SolanaService.subscribeToBalance()
    ↓
WebSocket Connection
    ↓
Account Change Event
    ↓
Callback Execution
    ↓
UI Update (setBalance)
    ↓
[On Unmount]
    ↓
Unsubscribe
```

---

## Security Architecture

### Key Management

```
User Creates Wallet
    ↓
Generate Ed25519 Keypair (tweetnacl)
    ↓
Encode with Base58 (bs58)
    ↓
Store in SecureStore (encrypted)
    ↓
Never expose in UI
```

### Transaction Signing

```
Transaction Data
    ↓
Serialize Transaction
    ↓
Sign with Private Key (Ed25519)
    ↓
Attach Signature
    ↓
Verify Signature
    ↓
Submit to Blockchain
```

### Biometric Protection

```
Sensitive Operation
    ↓
Check Biometric Availability
    ↓
Prompt User
    ↓
Verify Identity
    ↓
Allow Operation
```

---

## State Management

### Local State (useState)
- Screen-specific UI state
- Form inputs
- Loading states
- Modal visibility

### Service State (Singleton)
- Notification service
- Error recovery service
- Shared across app

### Persistent State (Storage)
- Wallet data
- Transaction history
- App settings
- Offline queue

---

## Error Handling Strategy

### Levels of Error Handling

1. **Service Level**
   - Try-catch blocks
   - Error logging
   - Return error objects

2. **Recovery Level**
   - Auto-retry logic
   - Exponential backoff
   - User-friendly messages

3. **UI Level**
   - Alert dialogs
   - Toast messages
   - Error states

### Error Types

```typescript
// Network Errors
- Connection timeout
- No internet
- RPC failure

// Transaction Errors
- Insufficient balance
- Invalid address
- Blockhash expired

// Bluetooth Errors
- Permission denied
- Device not found
- Connection timeout

// Authentication Errors
- Biometric failed
- Permission denied
```

---

## Performance Optimizations

### 1. **Lazy Initialization**
```typescript
// BluetoothService only initialized when needed
private getBluetoothService(): BluetoothService {
  if (!this.bluetooth) {
    this.bluetooth = new BluetoothService();
  }
  return this.bluetooth;
}
```

### 2. **Subscription Cleanup**
```typescript
useEffect(() => {
  const unsubscribe = solana.subscribeToBalance(publicKey, callback);
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

### 3. **Debounced Operations**
- Auto-sync every 30 seconds (not on every change)
- Pull-to-refresh with cooldown

### 4. **Efficient Re-renders**
- Minimal state updates
- Memoized components (where needed)
- Optimized list rendering

---

## Testing Strategy

### Unit Tests (Recommended)
```typescript
// Service tests
describe('SolanaService', () => {
  test('creates valid wallet', async () => {
    const wallet = await solana.createWallet();
    expect(wallet.publicKey).toBeDefined();
    expect(wallet.secretKey).toBeDefined();
  });
});
```

### Integration Tests
- Payment flow end-to-end
- Offline sync process
- Error recovery scenarios

### Manual Testing
- Physical device testing
- Bluetooth connectivity
- Biometric authentication
- Network switching

---

## Deployment Architecture

### Development
```
Local Machine
    ↓
Expo Dev Server
    ↓
Expo Go App
    ↓
Solana Testnet
```

### Production
```
Build Server
    ↓
App Store / Play Store
    ↓
User Device
    ↓
Solana Mainnet
```

---

## Scalability Considerations

### Current Limitations
- Single wallet per device
- No multi-signature support
- Limited transaction history (local)
- No cloud backup

### Future Enhancements
- Multiple wallet support
- Cloud sync
- Transaction indexing service
- Push notification server
- Analytics backend

---

## Security Best Practices

✅ **Implemented**
- Private keys never leave device
- Encrypted storage
- Biometric authentication
- Transaction verification
- Secure random generation

⚠️ **Recommended for Production**
- Security audit
- Penetration testing
- Code obfuscation
- Certificate pinning
- Rate limiting

---

## Monitoring & Logging

### Current Logging
```typescript
console.log('✅ Success messages');
console.error('❌ Error messages');
console.warn('⚠️ Warning messages');
```

### Production Recommendations
- Sentry for crash reporting
- Analytics (Mixpanel/Amplitude)
- Performance monitoring
- User behavior tracking

---

## Dependencies Graph

```
App.tsx
  ├─ NotificationService
  ├─ ErrorRecoveryService
  └─ StorageService

HomeScreen
  ├─ All Screens
  └─ NotificationService

WalletScreen
  ├─ SolanaService
  └─ StorageService

SendScreen
  ├─ PaymentService
  ├─ BiometricService
  └─ NotificationService

BluetoothPaymentScreen
  ├─ BluetoothService
  ├─ BiometricService
  ├─ NotificationService
  └─ StorageService

PaymentService
  ├─ SolanaService
  ├─ BluetoothService
  ├─ StorageService
  ├─ NotificationService
  └─ ErrorRecoveryService
```

---

## Build Configuration

### Expo Config (app.json)
```json
{
  "expo": {
    "name": "PayPulse",
    "slug": "paypulse",
    "version": "1.0.0",
    "sdkVersion": "54.0.0",
    "platforms": ["ios", "android"],
    "permissions": [
      "CAMERA",
      "BLUETOOTH",
      "BLUETOOTH_ADMIN",
      "ACCESS_FINE_LOCATION",
      "NOTIFICATIONS",
      "USE_BIOMETRIC"
    ]
  }
}
```

### TypeScript Config
- Strict mode enabled
- ES2020 target
- Module resolution: node

---

## Code Organization

```
mobile/
├── src/
│   ├── screens/          # UI screens
│   ├── components/       # Reusable components
│   ├── services/         # Business logic
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── App.tsx              # Entry point
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

---

## Design Patterns Used

1. **Singleton Pattern**
   - NotificationService
   - ErrorRecoveryService

2. **Service Pattern**
   - All business logic in services
   - Clear separation from UI

3. **Observer Pattern**
   - WebSocket subscriptions
   - Event listeners

4. **Strategy Pattern**
   - Online/offline payment routing

5. **Factory Pattern**
   - Wallet creation
   - Transaction building

---

**This architecture supports a scalable, maintainable, and secure payment application! 🏗️**
