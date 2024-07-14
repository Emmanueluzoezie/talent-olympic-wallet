import { useState, useEffect, useCallback } from 'react';
import { PublicKey, Signer, TokenBalance } from "@solana/web3.js";
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


  const connect = useCallback(async (publicKey?: string, signer?: Signer) => {
    if (publicKey && signer) {
      await walletInterface.connect(publicKey, signer);
    } else {
      console.warn('Connection method without publicKey and signer not implemented');
    }
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

  useEffect(() => {
    const handleNetworkChange = () => {
      updateWalletState();
    };
    window.addEventListener('walletNetworkChange', handleNetworkChange);

    return () => {
      window.removeEventListener('walletNetworkChange', handleNetworkChange);
    };
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