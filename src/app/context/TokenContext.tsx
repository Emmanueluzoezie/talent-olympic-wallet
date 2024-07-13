"use client"
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { TokenContextType } from '../types/Token';
import { TOKENS } from '../lib/TokenRegistry';
import { useWallet } from '../hook/useWallet';
import { PriceServiceConnection, PriceFeed } from "@pythnetwork/price-service-client";

const TokenContext = createContext<TokenContextType>({
  tokens: TOKENS,
  prices: {},
  balances: {},
  totalBalanceInUSDC: 0
});

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const { balances: walletBalances } = useWallet();

  useEffect(() => {
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

  const totalBalanceInUSDC = useMemo(() => {
    return Object.entries(balances).reduce((total, [symbol, balance]) => {
      const price = prices[symbol] || 0;
      const usdcPrice = prices['USDC'] || 1; // Assume USDC price is 1 if not available
      return total + (balance * price) / usdcPrice;
    }, 0);
  }, [balances, prices]);

  return (
    <TokenContext.Provider value={{ tokens: TOKENS, prices, balances, totalBalanceInUSDC }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenContext = () => useContext(TokenContext);