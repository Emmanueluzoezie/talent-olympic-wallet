import { useState, useEffect, useCallback } from 'react';
import { PublicKey, TokenBalance } from "@solana/web3.js";
import { walletInterface } from '../lib/WalletInterface';

export function useWallet() {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [network, setNetwork] = useState<string>('devnet');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const updateWalletState = useCallback(async () => {
    setPublicKey(walletInterface.getPublicKey());
    setNetwork(walletInterface.getNetwork());
    setIsConnected(walletInterface.isConnected());

    if (walletInterface.isConnected()) {
      try {
        const tokenBalances = await walletInterface.getAllTokenBalances();
        setBalances(tokenBalances);
      } catch (error) {
        console.error('Failed to fetch token balances:', error);
        setBalances([]);
      }
    } else {
      setBalances([]);
    }
  }, []);

  useEffect(() => {
    updateWalletState();
  }, [updateWalletState]);

  const connect = useCallback(async (publicKey: string, signer: any) => {
    walletInterface.setPublicKey(publicKey);
    walletInterface.setSigner(signer);
    await updateWalletState();
  }, [updateWalletState]);

  const disconnect = useCallback(async () => {
    walletInterface.disconnect();
    await updateWalletState();
  }, [updateWalletState]);

  const changeNetwork = useCallback(async (newNetwork: string) => {
    walletInterface.setNetwork(newNetwork);
    await updateWalletState();
  }, [updateWalletState]);

  return {
    balances,
    publicKey,
    network,
    isConnected,
    connection: walletInterface.getConnection(),
    connect,
    disconnect,
    changeNetwork,
    sendTransaction: walletInterface.sendTransaction.bind(walletInterface),
  };
}