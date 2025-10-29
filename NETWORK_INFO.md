# 🌐 PayPulse Network Information

## Current Network: Solana Testnet

PayPulse is configured to use **Solana Testnet** for all transactions.

### Network Details

| Property | Value |
|----------|-------|
| **Network** | Testnet |
| **RPC Endpoint** | https://api.testnet.solana.com |
| **Explorer** | https://explorer.solana.com/?cluster=testnet |
| **Faucet** | https://faucet.solana.com |
| **Chain ID** | Testnet |

## Why Testnet?

### Advantages
✅ **More Stable**: Better uptime than devnet
✅ **Production-Like**: Closer to mainnet behavior
✅ **Reliable**: Consistent performance for testing
✅ **Free SOL**: Get test tokens from faucet
✅ **Safe Testing**: No real money at risk

### Comparison

| Feature | Devnet | Testnet | Mainnet |
|---------|--------|---------|---------|
| Stability | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Uptime | 85% | 95% | 99.9% |
| Free SOL | ✅ | ✅ | ❌ |
| Real Value | ❌ | ❌ | ✅ |
| Best For | Quick tests | App development | Production |

## Getting Test SOL

### Step-by-Step Guide

1. **Open PayPulse App**
   - Navigate to "Receive" screen
   - Your wallet address is displayed with QR code

2. **Copy Your Address**
   - Tap "Copy Address" button
   - Or manually copy the address shown

3. **Visit Solana Faucet**
   - Go to: https://faucet.solana.com
   - Select **"Testnet"** from the network dropdown
   - Paste your wallet address
   - Complete CAPTCHA if required
   - Click "Request Airdrop"

4. **Wait for Confirmation**
   - Usually takes 5-10 seconds
   - You'll receive 1-2 SOL per request
   - Can request multiple times (with cooldown)

5. **Check Your Balance**
   - Return to PayPulse app
   - Balance updates automatically
   - Or pull down to refresh

### Faucet Limits
- **Amount**: 1-2 SOL per request
- **Cooldown**: ~1 hour between requests
- **Daily Limit**: ~10 SOL per address

## Viewing Transactions

### On Solana Explorer

1. **From Profile Screen**
   - Tap "View on Explorer"
   - Opens your address in browser

2. **Manual Method**
   - Go to: https://explorer.solana.com
   - Select "Testnet" from network dropdown
   - Paste your address in search
   - View all transactions and balance

### Transaction Details
- **Confirmation Time**: ~400ms
- **Block Time**: ~400ms
- **Finality**: ~13 seconds
- **Fee**: ~0.000005 SOL

## Network Status

### Check Network Health
- **Status Page**: https://status.solana.com
- **RPC Health**: Check in app (Online/Offline indicator)
- **Explorer**: https://explorer.solana.com/supply

### Common Issues

#### "Failed to fetch balance"
- **Cause**: Network congestion or RPC issues
- **Solution**: Wait a few seconds and try again
- **Alternative**: Check explorer directly

#### "Transaction failed"
- **Cause**: Insufficient balance or network error
- **Solution**: Ensure you have enough SOL for fees
- **Minimum**: Keep at least 0.001 SOL for fees

#### "Offline mode"
- **Cause**: No internet connection
- **Solution**: Payments will queue and sync when online
- **Feature**: This is expected behavior!

## Switching Networks (Future)

Currently, PayPulse is hardcoded to Testnet. Future versions will support:

### Planned Network Options
- ⏳ **Devnet**: For rapid development
- ✅ **Testnet**: Current default
- 🔜 **Mainnet**: For real transactions

### How to Switch (Coming Soon)
```
Settings → Network → Select Network
- Devnet (Development)
- Testnet (Testing) ✓
- Mainnet (Production)
```

## Developer Information

### RPC Configuration

```typescript
// Current configuration
const NETWORK = 'testnet';
const RPC_URL = 'https://api.testnet.solana.com';

// In SolanaService.ts
constructor(cluster: string = 'testnet') {
  this.rpcUrl = this.getClusterUrl(cluster);
}
```

### Changing Network (Manual)

To change the network, update:

1. **SolanaService.ts**
   ```typescript
   constructor(cluster: string = 'mainnet') // or 'devnet'
   ```

2. **PaymentService.ts**
   ```typescript
   this.solana = new SolanaService('mainnet');
   ```

3. **ProfileScreen.tsx**
   ```typescript
   Linking.openURL(`...?cluster=mainnet`);
   ```

## Security Notes

### Testnet vs Mainnet

⚠️ **Important Differences**:

| Aspect | Testnet | Mainnet |
|--------|---------|---------|
| SOL Value | $0 (worthless) | Real money |
| Security | Relaxed | Critical |
| Private Keys | Less critical | NEVER share |
| Backups | Optional | MANDATORY |
| Testing | Encouraged | Use with caution |

### Best Practices

#### On Testnet (Current)
- ✅ Test all features freely
- ✅ Share addresses publicly
- ✅ Experiment with transactions
- ✅ Report bugs and issues
- ⚠️ Still keep private keys secure (good practice)

#### On Mainnet (Future)
- 🔐 NEVER share private keys
- 🔐 Always backup wallet
- 🔐 Use hardware wallet if possible
- 🔐 Start with small amounts
- 🔐 Verify all addresses carefully

## Support

### Need Help?

**Network Issues**:
- Check https://status.solana.com
- Try again in a few minutes
- Contact support if persistent

**Can't Get Test SOL**:
- Try different faucet: https://solfaucet.com
- Ask in Discord/Telegram
- Check faucet cooldown period

**Transaction Problems**:
- Verify sufficient balance
- Check network status
- View transaction on explorer
- Contact support with TX hash

### Contact
- **Email**: support@paypulse.app
- **Telegram**: @paypulse
- **Discord**: discord.gg/paypulse

## Roadmap

### Network Features

**Phase 1** (Current)
- ✅ Testnet support
- ✅ Automatic RPC connection
- ✅ Balance checking
- ✅ Transaction submission

**Phase 2** (Coming Soon)
- 🔜 Network selector in settings
- 🔜 Custom RPC endpoints
- 🔜 Multiple network profiles
- 🔜 Network performance metrics

**Phase 3** (Future)
- ⏳ Mainnet support
- ⏳ Automatic network switching
- ⏳ RPC load balancing
- ⏳ Offline transaction batching

## FAQ

### Q: Why not use Devnet?
**A**: Testnet is more stable and reliable for app development. Devnet is often congested and has more downtime.

### Q: When will Mainnet be supported?
**A**: After thorough testing on Testnet. We want to ensure everything works perfectly before handling real funds.

### Q: Can I use my Testnet wallet on Mainnet?
**A**: Technically yes (same address format), but DON'T. Create a new wallet for Mainnet with proper backups.

### Q: How do I get more test SOL?
**A**: Use the faucet every hour, or ask in community channels. Some users share test SOL.

### Q: Are Testnet transactions permanent?
**A**: Yes, but the network can be reset. Don't rely on Testnet for permanent records.

### Q: What's the difference between Testnet and Mainnet transactions?
**A**: Technically identical, but Testnet SOL has no value and the network may be reset.

---

**Last Updated**: 2025-10-28
**Network**: Solana Testnet
**App Version**: 1.0.0
