import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Connection, PublicKey, Transaction, SystemProgram, Keypair, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

export class SolanaService {
  private connection: Connection;
  private cluster: string;
  private wsConnection: WebSocket | null = null;
  private balanceSubscriptions: Map<string, (balance: number) => void> = new Map();

  constructor(cluster: string = 'testnet') {
    this.cluster = cluster;
    const rpcUrl = this.getClusterUrl(cluster);
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  private getClusterUrl(cluster: string): string {
    switch (cluster) {
      case 'mainnet':
        return 'https://api.mainnet-beta.solana.com';
      case 'devnet':
        return 'https://api.devnet.solana.com';
      case 'testnet':
        return 'https://api.testnet.solana.com';
      default:
        return 'https://api.testnet.solana.com';
    }
  }

  private getWsUrl(cluster: string): string {
    switch (cluster) {
      case 'mainnet':
        return 'wss://api.mainnet-beta.solana.com';
      case 'devnet':
        return 'wss://api.devnet.solana.com';
      case 'testnet':
        return 'wss://api.testnet.solana.com';
      default:
        return 'wss://api.testnet.solana.com';
    }
  }

  async createWallet(): Promise<{ publicKey: string; secretKey: string }> {
    const keypair = nacl.sign.keyPair();
    return {
      publicKey: bs58.encode(keypair.publicKey),
      secretKey: bs58.encode(keypair.secretKey)
    };
  }

  async getBalance(publicKey: string): Promise<number> {
    try {
      const pubKey = new PublicKey(publicKey);
      const balance = await this.connection.getBalance(pubKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }

  // Subscribe to real-time balance updates
  subscribeToBalance(publicKey: string, callback: (balance: number) => void): () => void {
    try {
      const pubKey = new PublicKey(publicKey);
      
      // Store callback
      this.balanceSubscriptions.set(publicKey, callback);

      // Subscribe to account changes
      const subscriptionId = this.connection.onAccountChange(
        pubKey,
        (accountInfo) => {
          const balance = accountInfo.lamports / LAMPORTS_PER_SOL;
          callback(balance);
        },
        'confirmed'
      );

      // Return unsubscribe function
      return () => {
        this.connection.removeAccountChangeListener(subscriptionId);
        this.balanceSubscriptions.delete(publicKey);
      };
    } catch (error) {
      console.error('Failed to subscribe to balance:', error);
      return () => {};
    }
  }

  async sendTransaction(
    senderSecretKey: string,
    recipientPublicKey: string,
    amount: number
  ): Promise<string> {
    try {
      console.log('📤 Preparing transaction...');
      
      // Step 1: Decode secret key and create keypair
      const secretKeyBytes = bs58.decode(senderSecretKey);
      const keypair = Keypair.fromSecretKey(secretKeyBytes);
      
      // Step 2: Create recipient public key
      const recipientPubKey = new PublicKey(recipientPublicKey);
      
      // Step 3: Create transfer instruction
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: recipientPubKey,
          lamports,
        })
      );

      console.log('✅ Transaction created');

      // Step 4: Send and confirm transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [keypair],
        {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      );

      console.log('✅ Transaction confirmed:', signature);
      
      return signature;
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }

  async confirmTransaction(signature: string, maxRetries: number = 30): Promise<boolean> {
    try {
      for (let i = 0; i < maxRetries; i++) {
        const status = await this.connection.getSignatureStatus(signature);
        
        if (status.value?.confirmationStatus === 'confirmed' || 
            status.value?.confirmationStatus === 'finalized') {
          console.log('✅ Transaction confirmed');
          return true;
        }

        if (status.value?.err) {
          console.error('❌ Transaction failed:', status.value.err);
          return false;
        }

        // Wait 2 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('⏱️ Transaction confirmation timeout');
      return false;
    } catch (error) {
      console.error('Error confirming transaction:', error);
      return false;
    }
  }

  async isOnline(): Promise<boolean> {
    try {
      const version = await this.connection.getVersion();
      return !!version;
    } catch {
      return false;
    }
  }

  async requestAirdrop(publicKey: string, amount: number = 1): Promise<string> {
    try {
      const pubKey = new PublicKey(publicKey);
      const signature = await this.connection.requestAirdrop(
        pubKey,
        amount * LAMPORTS_PER_SOL
      );
      
      await this.connection.confirmTransaction(signature);
      console.log('✅ Airdrop successful:', signature);
      return signature;
    } catch (error) {
      console.error('❌ Airdrop failed:', error);
      throw error;
    }
  }

  async getRecentTransactions(publicKey: string, limit: number = 10): Promise<any[]> {
    try {
      const pubKey = new PublicKey(publicKey);
      const signatures = await this.connection.getSignaturesForAddress(pubKey, { limit });
      
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          return {
            signature: sig.signature,
            timestamp: sig.blockTime,
            status: sig.err ? 'failed' : 'confirmed',
            ...tx
          };
        })
      );

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }
}
