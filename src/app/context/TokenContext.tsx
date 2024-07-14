"use client"
import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { TokenContextType } from '../types/Token';
import { TOKENS } from '../lib/TokenRegistry';
import { useWallet } from '../hook/useWallet';
import { PriceServiceConnection } from "@pythnetwork/price-service-client";
import { walletInterface } from '../lib/WalletInterface';

const TokenContext = createContext<TokenContextType>({
  tokens: TOKENS,
  prices: {},
  balances: {},
  totalBalanceInUSDC: 0,
  refreshTokenData: async () => {} 
});

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const { balances: walletBalances } = useWallet();

  const refreshTokenData = useCallback(async () => {
    await fetchPrices();
    await fetchBalances();
  }, []);

  const fetchPrices = async () => {
    const connection = new PriceServiceConnection("https://hermes.pyth.network", {
      priceFeedRequestConfig: { binary: true },
    });

    const priceIds = TOKENS.map(token => token.pythPriceId).filter(Boolean) as string[];
    try {
      const priceFeeds = await connection.getLatestPriceFeeds(priceIds);

      if (priceFeeds && priceFeeds.length > 0) {
        const newPrices: { [key: string]: number } = {};
        priceFeeds.forEach((priceFeed: any) => {
          const token = TOKENS.find(t => t.pythTokenId.toLowerCase() === priceFeed.id.toLowerCase());
          if (token) {
            const priceInfo = priceFeed.price;
            if (priceInfo) {
              const price = Number(priceInfo.price);
              const expo = Number(priceInfo.expo);
              const calculatedPrice = price * Math.pow(10, expo);
              newPrices[token.symbol] = calculatedPrice;
            } 
          }
        });
        setPrices(newPrices);
      } 
    } catch (error) {
      console.error("Failed to fetch prices from Pyth:", error);
    }
  };

  useEffect(() => {
    fetchPrices();
    const intervalId = setInterval(fetchPrices, 60000);
  
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const newBalances: { [key: string]: number } = {};
    walletBalances.forEach((balance: any) => {
      const token = TOKENS.find((token: any) => token.address === balance.mint);
      if (token) {
        newBalances[token.symbol] = parseFloat(balance.uiTokenAmount.uiAmountString);
      }
    });
    setBalances(newBalances);
  }, [walletBalances]);

  useEffect(() => {
    refreshTokenData();
    const intervalId = setInterval(refreshTokenData, 60000);
    const handleNetworkChange = () => {
      refreshTokenData();
    };
    window.addEventListener('walletNetworkChange', handleNetworkChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('walletNetworkChange', handleNetworkChange);
    };
  }, [refreshTokenData]);


  const fetchBalances = async () => {
    if (walletInterface.isConnected()) {
      const publicKey = walletInterface.getPublicKey();
      if (publicKey) {
        const tokenBalances = await walletInterface.getAllTokenBalances();
        const newBalances: { [key: string]: number } = {};
        tokenBalances.forEach(balance => {
          newBalances[balance.mint] = balance.uiTokenAmount.uiAmount || 0;
        });
        setBalances(newBalances);
      }
    } else {
      setBalances({});
    }
  };

  const totalBalanceInUSDC = useMemo(() => {
    return Object.entries(balances).reduce((total, [symbol, balance]) => {
      const price = prices[symbol] || 0;
      const usdcPrice = prices['USDC'] || 1;
      return total + (balance * price) / usdcPrice;
    }, 0);
  }, [balances, prices]);

  const contextValue = useMemo(() => ({
    tokens: TOKENS,
    prices,
    balances,
    totalBalanceInUSDC,
    refreshTokenData
  }), [prices, balances, totalBalanceInUSDC, refreshTokenData]);

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenContext = () => useContext(TokenContext);