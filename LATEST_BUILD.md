# Latest Build Information

## 📱 Current APK (Preview Build)

**Download Link:**
```
https://expo.dev/accounts/rohit221101019/projects/paypulse/builds/5b88184d-02ba-4f53-973c-716b2589373b
```

**Build Details:**
- Platform: Android
- Profile: Preview (Standalone)
- Version: 1.0.0
- SDK: 54.0.0
- Built: October 30, 2025

---

## ✅ What's Fixed in This Build

### 1. Deterministic Wallet Generation
- Wallets are now generated from email + phone combination
- Same credentials = same wallet address
- No more changing wallet addresses on logout/login

### 2. Login Flow Added
- Welcome screen with "Create Account" and "Login" options
- Login restores your wallet using email + phone
- Proper logout that clears all data

### 3. Bluetooth Permissions
- Automatic permission requests for Android 12+
- Handles BLUETOOTH_SCAN, BLUETOOTH_CONNECT, and LOCATION permissions
- Clear error messages if permissions are denied

### 4. Clean Repository
- Removed node_modules from git tracking
- Deleted unnecessary MD files and batch scripts
- Added proper .gitignore
- Professional README.md

---

## 🚀 How to Install

1. **Download APK** on your Android phone:
   - Open the link above
   - Or scan the QR code from the build output

2. **Install the app:**
   - Tap the downloaded APK
   - Enable "Install from unknown sources" if prompted
   - Install PayPulse

3. **First time setup:**
   - Choose "Create New Account"
   - Enter name, email, and phone
   - Your wallet will be created

4. **To login later:**
   - Choose "Login with Existing Account"
   - Enter the same email and phone you registered with
   - Your wallet will be restored

---

## 🔐 Important Notes

### Wallet Recovery
Your wallet is deterministically generated from:
```
seed = "paypulse:" + email + ":" + phone
```

**Keep your email and phone safe!** They are your wallet recovery credentials.

### Bluetooth Testing
- Requires 2 physical Android devices
- Both devices need the same APK installed
- Bluetooth must be enabled on both devices
- Location permission is required for Bluetooth scanning

---

## 📊 Repository Status

**GitHub:** https://github.com/rohitjadhav07/PayPulser

**Latest Commit:**
```
Major update: Fixed wallet persistence, added login flow, Bluetooth permissions, and cleaned repo
```

**Clean Structure:**
```
PayPulse/
├── .gitignore          ✅ Proper exclusions
├── README.md           ✅ Professional documentation
├── ARCHITECTURE.md     ✅ Technical details
├── FEATURES.md         ✅ Feature list
├── mobile/             ✅ React Native app (no node_modules)
└── contracts/          ✅ Solana smart contracts
```

---

## 🎯 Next Steps

1. **Test the new build** on physical devices
2. **Verify wallet persistence** (logout/login with same credentials)
3. **Test Bluetooth** between two phones
4. **Report any issues** for further fixes

---

**Build Status:** ✅ Ready for Testing
**Repository:** ✅ Clean and Organized
**Documentation:** ✅ Complete
