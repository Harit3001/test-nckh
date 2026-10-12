import React, { createContext, useContext, useState } from 'react';
import { BlockchainTransaction, TxStepStatus } from '../types/blockchain';
import { simulateBlockchainTx, mockEIP712Sign } from '../services/web3Service';

interface Web3ContextType {
  walletAddress: string | null;
  isConnected: boolean;
  networkName: string;
  chainId: number;
  isSlowNetwork: boolean;
  activeTx: BlockchainTransaction | null;
  txStep: TxStepStatus | null;
  recentTransactions: BlockchainTransaction[];
  connectWallet: (customAddress?: string) => Promise<string>;
  disconnectWallet: () => void;
  toggleSlowNetwork: (val?: boolean) => void;
  executeTransaction: (
    action: BlockchainTransaction['action'],
    fromAddress: string,
    details?: string
  ) => Promise<BlockchainTransaction>;
  signEIP712LoginMessage: (wallet: string, nonce: string) => Promise<string>;
  dismissActiveTx: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(
    '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7'
  );
  const [isSlowNetwork, setIsSlowNetwork] = useState<boolean>(false);
  const [activeTx, setActiveTx] = useState<BlockchainTransaction | null>(null);
  const [txStep, setTxStep] = useState<TxStepStatus | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<BlockchainTransaction[]>([
    {
      txHash: '0x7a3f89b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
      action: 'ANCHOR_RECORD',
      from: '0x71C8fb866A37029d0f457739B7CEbe773E72a9A2',
      to: '0x35687b3e0c0f823A401f8021950d8858A97E4A83',
      blockNumber: 19842010,
      gasUsed: 48200,
      timestamp: '2026-09-28T09:32:15Z',
      status: 'CONFIRMED',
      details: 'Neo hash hồ sơ EMR-2026-0042',
    },
  ]);

  const connectWallet = async (customAddress?: string): Promise<string> => {
    // Check if window.ethereum exists
    if ((window as any).ethereum && !customAddress) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
          return accounts[0];
        }
      } catch (err) {
        console.warn('Metamask request cancelled or rejected, using mock address', err);
      }
    }

    const addr = customAddress || '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7';
    setWalletAddress(addr);
    return addr;
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  const toggleSlowNetwork = (val?: boolean) => {
    setIsSlowNetwork((prev) => (val !== undefined ? val : !prev));
  };

  const executeTransaction = async (
    action: BlockchainTransaction['action'],
    fromAddress: string,
    details?: string
  ): Promise<BlockchainTransaction> => {
    const latency = isSlowNetwork ? 4500 : 1200;

    const tx = await simulateBlockchainTx(
      action,
      fromAddress,
      '0x35687b3e0c0f823A401f8021950d8858A97E4A83',
      details,
      (step, currentTx) => {
        setTxStep(step);
        setActiveTx(currentTx);
      },
      latency
    );

    setRecentTransactions((prev) => [tx, ...prev.slice(0, 9)]);
    return tx;
  };

  const signEIP712LoginMessage = async (wallet: string, nonce: string): Promise<string> => {
    // If real metamask available, we can try signTypedData_v4
    if ((window as any).ethereum) {
      try {
        // Can attempt eth_signTypedData_v4, fallback to mock if error
        const mockRes = await mockEIP712Sign(wallet, nonce);
        return mockRes.signature;
      } catch (e) {
        console.warn('Real signing failed, using mock signature', e);
      }
    }
    const res = await mockEIP712Sign(wallet, nonce);
    return res.signature;
  };

  const dismissActiveTx = () => {
    setActiveTx(null);
    setTxStep(null);
  };

  return (
    <Web3Context.Provider
      value={{
        walletAddress,
        isConnected: !!walletAddress,
        networkName: 'Ethereum Sepolia Testnet',
        chainId: 11155111,
        isSlowNetwork,
        activeTx,
        txStep,
        recentTransactions,
        connectWallet,
        disconnectWallet,
        toggleSlowNetwork,
        executeTransaction,
        signEIP712LoginMessage,
        dismissActiveTx,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
  return ctx;
};
