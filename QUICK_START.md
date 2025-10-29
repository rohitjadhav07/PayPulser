# 🚀 PayPulse - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- For Bluetooth testing: 2 physical devices

---

## Installation

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Scan the QR code** with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

---

## First Time Setup

1. **Create Wallet**
   - App will guide you through onboarding
   - Wallet is created automatically
   - Private key is stored securely

2. **Get Test SOL** (Testnet)
   - Use Solana faucet: https://faucet.solana.com
   - Or use in-app airdrop feature (coming soon)

3. **Enable Permissions**
   - Camera (for QR scanning)
   - Bluetooth (for offline payments)
   - Notifications (for payment alerts)
   - Biometric (for secure payments)

---

## Features to Test

### ✅ Online Payments
1. Go to **Send** screen
2. Enter recipient address (or scan QR)
3. Enter amount
4. Authenticate with biometric
5. Confirm transaction

### ✅ Receive Payments
1. Go to **Receive** screen
2. Share your QR code or address
3. Wait for payment
4. Get push notification

### ✅ Bluetooth Payments (Offline)
**Sender:**
1. Go to **Bluetooth** screen
2. Switch to **Send** mode
3. Scan for devices
4. Select recipient
5. Enter amount and send

**Receiver:**
1. Go to **Bluetooth** screen
2. Switch to **Receive** mode
3. Enable advertising
4. Accept incoming payment

### ✅ Transaction History
1. Go to **History** screen
2. View all transactions
3. Filter by status
4. Tap transaction for details

### ✅ Settings
1. Go to **Settings** (from wallet screen)
2. Change network (Testnet/Devnet/Mainnet)
3. Toggle biometric auth
4. Toggle notifications
5. Export private key (secure)

---

## Testing Scenarios

### Scenario 1: Online Payment
```
1. Get testnet SOL from faucet
2. Send to another wallet
3. Check transaction on Solana Explorer
4. Verify push notification
5. Check transaction history
```

### Scenario 2: Offline Payment
```
1. Turn off WiFi/Data on both devices
2. Enable Bluetooth on both
3. Receiver: Enable advertising
4. Sender: Scan and send payment
5. Turn WiFi back on
6. Watch auto-sync happen
7. Verify on blockchain
```

### Scenario 3: Error Recovery
```
1. Send payment with poor connection
2. Let it fail
3. Watch auto-retry
4. Check error messages
5. Verify recovery
```

---

## Troubleshooting

### App won't start
```bash
# Clear cache and restart
cd mobile
rm -rf node_modules
npm install
npx expo start -c
```

### Bluetooth not working
- Enable Bluetooth in device settings
- Grant location permission (Android requirement)
- Make sure both devices are nearby
- Check that receiver is advertising

### Transactions failing
- Check internet connection
- Verify sufficient balance
- Try switching networks in Settings
- Check Solana network status

### Biometric not working
- Enable biometric in device settings
- Grant permission in app settings
- Check device compatibility

---

## Development Commands

```bash
# Start development server
npx expo start

# Start with cache clear
npx expo start -c

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Build for production
npx expo build:android
npx expo build:ios
```

---

## Network Configuration

### Current: Testnet (Default)
- Safe for testing
- Free SOL from faucet
- No real money

### Switch to Devnet
1. Go to Settings
2. Select Devnet
3. Restart app

### Switch to Mainnet ⚠️
1. Go to Settings
2. Select Mainnet
3. Confirm warning
4. Restart app
5. **Use real SOL carefully!**

---

## Key Features

### 🔐 Security
- Ed25519 signatures
- Secure key storage
- Biometric authentication
- Transaction verification

### 📱 Offline-First
- Bluetooth payments
- Transaction queue
- Auto-sync when online
- No internet required

### 🔔 Notifications
- Payment received
- Payment sent
- Transaction confirmed
- Sync complete

### 🔄 Error Recovery
- Auto-retry failed transactions
- User-friendly error messages
- State recovery
- Network resilience

### 📊 Real-Time
- Live balance updates
- WebSocket connection
- Instant notifications
- Status indicators

---

## Support

### Common Issues

**Q: Can I use this on mainnet?**
A: Yes, but be careful! Switch to mainnet in Settings. Test thoroughly on testnet first.

**Q: How do I backup my wallet?**
A: Go to Settings → Export Private Key (requires biometric auth). Store it safely!

**Q: What if I lose my phone?**
A: If you have your private key backed up, you can restore your wallet. Otherwise, funds are lost.

**Q: Can I send to any Solana address?**
A: Yes! Any valid Solana address works.

**Q: Do offline payments work without internet?**
A: Yes! They're queued and sync automatically when you're back online.

---

## Next Steps

1. ✅ Test all features on testnet
2. ✅ Try Bluetooth payments with a friend
3. ✅ Explore settings and customization
4. ✅ Check transaction details
5. ✅ Test error scenarios

---

## Resources

- **Solana Docs**: https://docs.solana.com
- **Solana Explorer**: https://explorer.solana.com
- **Solana Faucet**: https://faucet.solana.com
- **Expo Docs**: https://docs.expo.dev

---

**Enjoy using PayPulse! 🎉**

For issues or questions, check the logs in the terminal where you ran `npx expo start`.
