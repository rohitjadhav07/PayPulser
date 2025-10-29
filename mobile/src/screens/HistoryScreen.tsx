import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StorageService } from '../services/StorageService';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  recipient?: string;
  sender?: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'syncing' | 'failed';
  mode: 'online' | 'offline';
  txHash?: string;
}

interface HistoryScreenProps {
  onBack: () => void;
  onTransactionSelect?: (transaction: Transaction) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, onTransactionSelect }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const storage = new StorageService();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      // Load offline/pending transactions
      const offlineTxs = await storage.getOfflineTransactions();
      
      // Convert to Transaction format
      const transactions: Transaction[] = offlineTxs.map(tx => ({
        id: tx.id,
        type: 'send', // Offline transactions are always sends
        amount: tx.amount,
        recipient: tx.recipient,
        timestamp: tx.timestamp,
        status: 'pending',
        mode: 'offline'
      }));

      // Add mock completed transactions for demo
      // In production, fetch from Solana blockchain
      const mockCompleted: Transaction[] = [
        {
          id: 'demo-1',
          type: 'receive',
          amount: 1.0,
          sender: 'Demo...Sender',
          timestamp: Date.now() - 3600000,
          status: 'completed',
          mode: 'online',
          txHash: 'Demo...Hash'
        }
      ];

      setTransactions([...transactions, ...mockCompleted]);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#14F195';
      case 'pending': return '#FFA500';
      case 'syncing': return '#00D4FF';
      case 'failed': return '#FF6B9D';
      default: return '#888';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'pending') return tx.status === 'pending' || tx.status === 'syncing';
    if (filter === 'completed') return tx.status === 'completed';
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📭</Text>
            <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
            <Text style={styles.emptyStateText}>
              Your transaction history will appear here once you start sending or receiving SOL.
            </Text>
          </View>
        ) : (
          filteredTransactions.map((tx) => (
            <TouchableOpacity 
              key={tx.id} 
              style={styles.transactionCard}
              onPress={() => onTransactionSelect?.(tx)}
            >
              <View style={[
                styles.transactionIcon,
                { backgroundColor: tx.type === 'send' ? '#9945FF' : '#14F195' }
              ]}>
                <Text style={styles.transactionIconText}>
                  {tx.type === 'send' ? '↑' : '↓'}
                </Text>
              </View>

              <View style={styles.transactionInfo}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionType}>
                    {tx.type === 'send' ? 'Sent to' : 'Received from'}
                  </Text>
                  {tx.mode === 'offline' && (
                    <View style={styles.offlineBadge}>
                      <Text style={styles.offlineBadgeText}>⚡ Offline</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.transactionAddress}>
                  {tx.type === 'send' ? tx.recipient : tx.sender}
                </Text>
                <View style={styles.transactionFooter}>
                  <Text style={styles.transactionTime}>{formatTime(tx.timestamp)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tx.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(tx.status) }]}>
                      {getStatusText(tx.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.transactionAmount}>
                <Text style={[
                  styles.amountText,
                  { color: tx.type === 'send' ? '#FF6B9D' : '#14F195' }
                ]}>
                  {tx.type === 'send' ? '-' : '+'}{tx.amount.toFixed(4)}
                </Text>
                <Text style={styles.amountCurrency}>SOL</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
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
    backgroundColor: '#1A1A24',
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
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A24',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#14F195',
  },
  filterText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#000',
  },
  list: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 24,
    color: '#000',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionType: {
    color: '#888',
    fontSize: 12,
    marginRight: 8,
  },
  offlineBadge: {
    backgroundColor: '#00D4FF20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  offlineBadgeText: {
    color: '#00D4FF',
    fontSize: 10,
    fontWeight: '600',
  },
  transactionAddress: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  transactionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionTime: {
    color: '#666',
    fontSize: 12,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountCurrency: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
});
