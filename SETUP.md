# Setup Guide

## ✅ Completed Steps

### 1. Rust Installation
- ✅ Rust 1.90.0 installed successfully
- ✅ Cargo package manager available

### 2. Mobile App Setup
- ✅ Dependencies installed
- ✅ Expo development server starting

## 🚀 Next Steps

### Run the Mobile App

The Expo server is starting. Once ready:

1. **Scan the QR code** with Expo Go app on your phone
2. Or press:
   - `a` - Open on Android emulator
   - `i` - Open on iOS simulator
   - `w` - Open in web browser

### Install Expo Go on Your Phone
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent
- **iOS**: https://apps.apple.com/app/expo-go/id982107779

## 📱 Testing the App

Once the app loads:
1. You'll see a balance card (initially 0 SOL)
2. Enter a recipient Solana address
3. Enter an amount
4. Tap "Send Payment"
5. The app will auto-detect online/offline mode

## 🔧 Solana Smart Contract (Optional)

The Solana CLI installation had issues. You can:

**Option 1: Manual Installation**
Download from: https://docs.solana.com/cli/install-solana-cli-tools

**Option 2: Use WSL (Windows Subsystem for Linux)**
```bash
wsl --install
# Then in WSL:
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

**Option 3: Skip for now**
The mobile app works with standard Solana transfers. You only need the custom program for advanced offline payment batching.

## 🔑 Creating a Wallet

The app will auto-generate a wallet on first launch. To fund it:

1. Get your public key from the app
2. Visit https://faucet.solana.com (for devnet)
3. Paste your address and request SOL

## 🛠️ Development Commands

```bash
# Start Expo server
cd mobile
npm start

# Run on specific platform
npm run android
npm run ios
npm run web

# Clear cache if needed
npx expo start --clear
```

## 📦 Project Structure

```
solana-bluetooth-payment/
├── mobile/                    # React Native app
│   ├── src/
│   │   ├── services/         # Core services
│   │   │   ├── SolanaService.ts      # Blockchain interactions
│   │   │   ├── BluetoothService.ts   # BLE & crypto signing
│   │   │   ├── StorageService.ts     # Secure storage
│   │   │   └── PaymentService.ts     # Payment orchestration
│   │   ├── screens/          # UI screens
│   │   │   └── HomeScreen.tsx
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Helpers
│   ├── App.tsx               # Entry point
│   └── package.json
├── contracts/                 # Solana programs (Rust)
│   └── payment-program/
└── README.md
```

## 🔐 Security Notes

- Private keys are encrypted in secure storage
- Offline transactions use Ed25519 signatures
- All transactions verified before blockchain submission
- Nonce system prevents replay attacks

## 🐛 Troubleshooting

**"Project is incompatible with this version of Expo Go"**
- Fixed! Using SDK 49 now

**Bluetooth not working**
- Ensure location permissions granted (Android)
- Check Bluetooth is enabled
- Pair devices first

**Balance shows 0**
- You're on devnet - request test SOL from faucet
- Check internet connection for balance updates

**App won't load**
- Run: `npx expo start --clear`
- Delete node_modules and run `npm install` again
