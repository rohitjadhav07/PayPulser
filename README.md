# PayPulse 💸⚡

**Offline-First Crypto Payments via Bluetooth**

PayPulse is a revolutionary mobile payment app that enables Solana (SOL) transactions even without internet connectivity. Send and receive crypto payments via Bluetooth, with automatic synchronization when you're back online.

---

## ✨ Features

### 🔌 Offline Payments
- **Bluetooth LE Protocol**: Send SOL to nearby devices without internet
- **Cryptographic Security**: All transactions are signed and verified
- **Auto-Sync**: Transactions automatically sync to blockchain when online

### 💼 Wallet Management
- **Deterministic Wallets**: Your wallet is derived from your credentials
- **Secure Storage**: Private keys encrypted and stored locally
- **Easy Recovery**: Login with email + phone to restore your wallet

### 🎨 Modern UI
- **Animated Gradients**: Beautiful, fluid background animations
- **Dark Theme**: Eye-friendly interface optimized for mobile
- **Intuitive Design**: Simple, clean user experience

### 🔐 Security
- **End-to-End Encryption**: Keys never leave your device
- **Signature Verification**: All transactions cryptographically verified
- **Secure Storage**: Uses Expo SecureStore for sensitive data

---

## 🏗️ Architecture

```
PayPulse/
├── mobile/                 # React Native + Expo app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # App screens
│   │   ├── services/      # Business logic
│   │   │   ├── BluetoothService.ts    # BLE protocol
│   │   │   ├── SolanaService.ts       # Blockchain integration
│   │   │   ├── StorageService.ts      # Local storage
│   │   │   └── SyncService.ts         # Offline sync
│   │   └── types/         # TypeScript definitions
│   └── App.tsx            # Entry point
│
├── contracts/             # Solana smart contracts (Rust)
│   └── payment-program/   # On-chain payment verification
│
├── ARCHITECTURE.md        # Detailed architecture docs
└── FEATURES.md           # Feature specifications
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Android device (Bluetooth requires physical device)
- Solana CLI (for contract development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/paypulse.git
cd paypulse
```

2. **Install mobile dependencies**
```bash
cd mobile
npm install
```

3. **Start development server**
```bash
npx expo start
```

4. **Build for Android**
```bash
# Development build (with dev tools)
eas build --platform android --profile development

# Preview build (standalone)
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production
```

---

## 📱 Usage

### First Time Setup
1. **Create Account**: Enter your name, email, and phone
2. **Wallet Creation**: A secure Solana wallet is generated
3. **Get Started**: You're ready to send and receive payments!

### Sending Payments (Offline)
1. Open the app and tap **"Bluetooth"**
2. Tap **"Scan for Devices"**
3. Select recipient from the list
4. Enter amount and confirm
5. Transaction is sent via Bluetooth
6. Auto-syncs when you're back online

### Receiving Payments (Offline)
1. Open the app and tap **"Bluetooth"**
2. Tap **"Receive"** tab
3. Toggle **"Enable Advertising"** ON
4. Your device is now discoverable
5. Accept incoming payment requests

### Online Payments
1. Tap **"Send"** on home screen
2. Enter recipient's wallet address
3. Enter amount and confirm
4. Transaction is sent to Solana blockchain

---

## 🔧 Technology Stack

### Mobile App
- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build tooling
- **TypeScript** - Type-safe JavaScript
- **react-native-ble-plx** - Bluetooth Low Energy
- **@solana/web3.js** - Solana blockchain integration
- **TweetNaCl** - Cryptographic signing
- **Expo SecureStore** - Encrypted local storage

### Smart Contracts
- **Rust** - Systems programming language
- **Anchor** - Solana development framework
- **Solana Program Library** - On-chain utilities

---

## 🔐 Security Considerations

### Wallet Security
- Private keys are generated using cryptographically secure random number generation
- Keys are stored encrypted in device secure storage
- Deterministic wallet generation allows recovery from credentials

### Transaction Security
- All transactions are signed with Ed25519 signatures
- Signatures are verified before acceptance
- Nonces prevent replay attacks
- Timestamps ensure transaction freshness

### Bluetooth Security
- Custom BLE protocol with UUIDs
- Cryptographic verification of all data
- No sensitive data transmitted unencrypted
- Recipient must explicitly accept transactions

---

## 🧪 Testing

### Test Bluetooth on Physical Devices

**⚠️ Current Limitation:**
BLE advertising (peripheral mode) is not yet implemented. See `BLUETOOTH_WORKAROUND.md` for details.

**Workaround for Testing:**

**Requirements:**
- 2 Android phones
- PayPulse APK installed on both

**Steps:**
1. **Pair devices via Android Bluetooth settings first:**
   - Phone A: Settings → Bluetooth → Make discoverable
   - Phone B: Settings → Bluetooth → Scan and pair with Phone A

2. **Test in PayPulse:**
   - Phone A: Open PayPulse → Bluetooth → Receive tab (shows wallet address)
   - Phone B: Open PayPulse → Bluetooth → Send tab → Scan for Devices
   - Phone B should see Phone A in the device list
   - Select device and test payment flow

**Alternative:**
- Use wallet address sharing (copy/paste or QR code)
- Implement QR code scanning for easier address exchange

---

## 📊 Roadmap

- [x] Basic wallet functionality
- [x] Online Solana payments
- [x] Bluetooth offline payments
- [x] Transaction signing and verification
- [x] Auto-sync when online
- [ ] Multi-signature support
- [ ] QR code payments
- [ ] Transaction history
- [ ] Push notifications
- [ ] iOS support
- [ ] Biometric authentication
- [ ] Multiple wallet support
- [ ] Token support (SPL tokens)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Solana Foundation for the amazing blockchain platform
- Expo team for the excellent mobile development tools
- React Native BLE PLX for Bluetooth functionality
- The open-source community

---

## 📞 Contact

For questions, issues, or suggestions:
- Open an issue on GitHub
- Email: your-email@example.com

---

**Built with ❤️ for the future of offline payments**
