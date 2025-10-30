# Bluetooth Workaround Guide

## 🔴 Current Limitation

The `react-native-ble-plx` library used in PayPulse **does not support BLE peripheral mode** (advertising). This means:

- ❌ Devices cannot advertise themselves as PayPulse receivers
- ❌ Automatic device discovery doesn't work as intended
- ✅ Scanning for existing Bluetooth devices works
- ✅ All cryptographic signing and transaction logic works

## 🔧 Workaround Options

### Option 1: Manual Bluetooth Pairing (Recommended for Testing)

**Steps:**

1. **On Receiver's Phone:**
   - Go to Android Settings → Bluetooth
   - Make sure Bluetooth is ON
   - Make device discoverable (usually automatic when Bluetooth settings are open)

2. **On Sender's Phone:**
   - Go to Android Settings → Bluetooth
   - Pair with the receiver's device manually
   - Return to PayPulse app
   - Tap "Scan for Devices"
   - You should see the paired device

3. **Alternative - Share Wallet Address:**
   - Receiver opens PayPulse → Bluetooth → Receive tab
   - Copy wallet address
   - Share via SMS, WhatsApp, or QR code
   - Sender enters address manually

### Option 2: QR Code Payment (Future Implementation)

Instead of Bluetooth discovery, use QR codes:

1. Receiver generates QR code with wallet address
2. Sender scans QR code
3. Transaction is created and signed
4. Can be transmitted via:
   - Bluetooth file transfer
   - NFC
   - Local WiFi Direct
   - Manual copy/paste

### Option 3: NFC Alternative

For very close-range payments:
- Use NFC instead of Bluetooth
- Requires `react-native-nfc-manager`
- Works within 4cm range
- More reliable for peer-to-peer

### Option 4: WiFi Direct

For local network payments:
- Use WiFi Direct instead of Bluetooth
- Faster data transfer
- Better range (up to 200m)
- Requires `react-native-wifi-p2p`

## 🛠️ Technical Solution (For Production)

To implement proper BLE advertising, you need:

### 1. Native Module for Android

Create a custom native module using Android's `BluetoothLeAdvertiser`:

```kotlin
// android/app/src/main/java/com/paypulse/BLEAdvertiserModule.kt
class BLEAdvertiserModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    private val bluetoothAdapter: BluetoothAdapter? = 
        BluetoothAdapter.getDefaultAdapter()
    
    private val advertiser: BluetoothLeAdvertiser? = 
        bluetoothAdapter?.bluetoothLeAdvertiser
    
    @ReactMethod
    fun startAdvertising(serviceUuid: String, promise: Promise) {
        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(true)
            .build()
        
        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(true)
            .addServiceUuid(ParcelUuid.fromString(serviceUuid))
            .build()
        
        advertiser?.startAdvertising(settings, data, advertiseCallback)
        promise.resolve(true)
    }
}
```

### 2. iOS Native Module

```swift
// ios/BLEAdvertiserModule.swift
@objc(BLEAdvertiserModule)
class BLEAdvertiserModule: NSObject {
    var peripheralManager: CBPeripheralManager?
    
    @objc
    func startAdvertising(_ serviceUuid: String, 
                         resolver: @escaping RCTPromiseResolveBlock,
                         rejecter: @escaping RCTPromiseRejectBlock) {
        let uuid = CBUUID(string: serviceUuid)
        peripheralManager?.startAdvertising([
            CBAdvertisementDataServiceUUIDsKey: [uuid],
            CBAdvertisementDataLocalNameKey: "PayPulse"
        ])
        resolver(true)
    }
}
```

### 3. Alternative: Use Expo Modules

Create an Expo module with native code:

```bash
npx create-expo-module ble-advertiser
```

## 📱 Current App Behavior

**Send Tab:**
- ✅ Scans for ALL nearby Bluetooth devices
- ✅ Shows device names and IDs
- ⚠️ May show non-PayPulse devices
- ⚠️ Cannot filter for PayPulse-specific devices

**Receive Tab:**
- ⚠️ "Enable Advertising" button is non-functional
- ✅ Shows your wallet address
- ✅ You can copy and share manually

## 🎯 Recommended Approach for Now

**For Testing:**

1. **Use Manual Pairing:**
   - Pair devices via Android Bluetooth settings
   - Then use PayPulse to scan

2. **Use Wallet Address Sharing:**
   - Copy wallet address from Receive tab
   - Share via any messaging app
   - Sender enters address manually

3. **Wait for Native Module:**
   - We'll implement proper BLE advertising
   - Will require a new build with native code

## 📊 Implementation Priority

1. ✅ **Phase 1 (Current):** Basic Bluetooth scanning
2. 🔄 **Phase 2 (Next):** QR code payments
3. 🔄 **Phase 3:** Native BLE advertising module
4. 🔄 **Phase 4:** NFC support
5. 🔄 **Phase 5:** WiFi Direct support

## 🚀 Quick Test Guide

**To test Bluetooth functionality right now:**

1. **Pair devices first:**
   ```
   Phone A: Settings → Bluetooth → Make discoverable
   Phone B: Settings → Bluetooth → Scan → Pair with Phone A
   ```

2. **Open PayPulse on both phones**

3. **On Phone A (Sender):**
   ```
   Bluetooth tab → Send → Scan for Devices
   Should see Phone B in the list
   ```

4. **Select Phone B and send payment**

5. **Transaction will be signed and ready**
   (Actual transmission requires additional implementation)

---

**Note:** This is a known limitation of React Native BLE libraries. Most production apps use native modules or alternative methods (QR codes, NFC) for device-to-device payments.
