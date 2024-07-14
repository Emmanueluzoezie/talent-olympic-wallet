"use client"
import React, { useState, useCallback } from 'react'
import CurrencyInput from './CurrencyInput';
import CurrencyDropdown from './CurrencyDropDown';
import { PublicKey } from '@solana/web3.js';
import { executeSwap } from '../utils/whirlpoolSwap';
import { useTokenContext } from '../context/TokenContext';
import { useWallet } from '../hook/useWallet';
import { SelectTokenType } from '../types/Token';

const SwapInterface = () => {
  const { tokens, prices, balances } = useTokenContext();
  const { connection, publicKey } = useWallet();
  const [fromCurrency, setFromCurrency] = useState<SelectTokenType>({
    symbol: "SOL",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToIG8feZdv7SVG0RYdGFUy8FDf_wxddAruJQ&s"
  });
  const [toCurrency, setToCurrency] = useState<SelectTokenType>({
    symbol: "USDC",
    image: "https://s3.coinmarketcap.com/static-gravity/image/5a8229787b5e4c809b5914eef709b59a.png"
  });
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [showFromDropdown, setShowFromDropdown] = useState<boolean>(false);
  const [showToDropdown, setShowToDropdown] = useState<boolean>(false);
  const [inSufficient, setInSufficent] = useState<boolean>(false)

  const handleFromCurrencyClick = () => setShowFromDropdown(!showFromDropdown);
  const handleToCurrencyClick = () => setShowToDropdown(!showToDropdown);

  const filteredFromTokens = tokens.filter(token => 
    token.symbol !== toCurrency.symbol
  );

  const filteredToTokens = tokens.filter(token => 
    token.symbol !== fromCurrency.symbol
  );

  const handleFromCurrencySelect = (token: SelectTokenType) => {
    setFromCurrency({
      symbol: token.symbol,
      image: token.image
    });
    setShowFromDropdown(false);
  };

  const handleFromAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)){
      const formattedValue = value.includes('.') ? value.slice(0, value.indexOf('.') + 7) : value;
      setFromAmount(formattedValue);
    }
    
    if (balances === undefined || balances[fromCurrency.symbol] < Number(value)) {
      setInSufficent(true);
    } else {
      setInSufficent(false);
    }
  }

  const handleToCurrencySelect = (token: SelectTokenType) => {
    setToCurrency({
      symbol: token.symbol,
      image: token.image
    });
    setShowToDropdown(false);
  };

  const handleMaxClick = () => {
    setFromAmount(balances[fromCurrency.symbol]?.toString() || '0');
  };

  const handleSwap = useCallback(async () => {
    if (!publicKey) {
        alert('Please connect your wallet');
        return;
    }

    const fromToken = tokens.find(t => t.symbol === fromCurrency.symbol);
    const toToken = tokens.find(t => t.symbol === toCurrency.symbol);

    if (!fromToken || !toToken) {
        alert('Invalid token selection');
        return;
    }

    try {
        const signature = await executeSwap(
            connection,
            publicKey,
            new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'),
            new PublicKey(fromToken.address),
            new PublicKey(toToken.address),
            fromAmount
        );
        console.log('Swap executed successfully:', signature);
        // Update balances and UI here
    } catch (error) {
        console.error('Swap failed:', error);
        alert('Swap failed. Please try again.');
    }
}, [connection, publicKey, tokens, fromCurrency, toCurrency, fromAmount]);

  return (
    <div className='h-[500px] p-2 rounded'>
      <div className='flex flex-col h-full'>
        <div className='flex justify-center'>
          <h2 className='px-4 py-[1px] button-bgcolor rounded font-semibold button-textcolor'>Swap</h2>
        </div>

        <div className="relative flex-1">
          <div className="relative my-8">
          <CurrencyInput
          selectedCurrency={fromCurrency}
          onCurrencyClick={handleFromCurrencyClick}
          onInputChange={handleFromAmount}
          amount={fromAmount}
          onMaxClick={handleMaxClick}
          inSufficient
        />
        {showFromDropdown && <CurrencyDropdown onSelect={handleFromCurrencySelect} tokens={filteredFromTokens} />}
          </div>

          <div className="relative my-4">
            <CurrencyInput
              selectedCurrency={toCurrency}
              onCurrencyClick={handleToCurrencyClick}
              onInputChange={(e) => setToAmount(e.target.value)}
              amount={toAmount}
              disabled
            />
            {showToDropdown && <CurrencyDropdown onSelect={handleToCurrencySelect} tokens={filteredToTokens} />}
          </div>
        </div>

        <div className='p-2 pb-4'>
          <button className={`py-2 rounded-xl w-full`} onClick={handleSwap}>Swap</button>
        </div>
      </div>
    </div>
  )
}

export default SwapInterface