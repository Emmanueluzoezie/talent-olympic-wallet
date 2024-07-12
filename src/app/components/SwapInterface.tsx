import Image from 'next/image'
import React, { useState } from 'react'
import CurrencyInput from './CurrencyInput';
import CurrencyDropdown from './CurrencyDropDown';

const SwapInterface = () => {
  const [fromCurrency, setFromCurrency] = useState<string>('SOL');
  const [toCurrency, setToCurrency] = useState<string>('SOL');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [showFromDropdown, setShowFromDropdown] = useState<boolean>(false);
  const [showToDropdown, setShowToDropdown] = useState<boolean>(false);

  const handleFromCurrencyClick = () => setShowFromDropdown(!showFromDropdown);
  const handleToCurrencyClick = () => setShowToDropdown(!showToDropdown);

  const handleFromCurrencySelect = (currency: string) => {
    setFromCurrency(currency);
    setShowFromDropdown(false);
  };

  const handleToCurrencySelect = (currency: string) => {
    setToCurrency(currency);
    setShowToDropdown(false);
  };

  const handleMaxClick = () => {
    setFromAmount('100'); // Example max amount
  };

  return (
    <div className='h-[500px] p-2'>
      <div className='flex flex-col h-full'>
        <div className='flex justify-center'>
          <h2 className='px-4 py-1 bg-zinc-200'>Swap</h2>
        </div>

        <div className="relative flex-1">
          <div className="relative my-4">
            <CurrencyInput
              selectedCurrency={fromCurrency}
              onCurrencyClick={handleFromCurrencyClick}
              onInputChange={(e) => setFromAmount(e.target.value)}
              amount={fromAmount}
              onMaxClick={handleMaxClick}
            />
            {showFromDropdown && <CurrencyDropdown onSelect={handleFromCurrencySelect} />}
          </div>

          <div className="relative my-4">
            <CurrencyInput
              selectedCurrency={toCurrency}
              onCurrencyClick={handleToCurrencyClick}
              onInputChange={(e) => setToAmount(e.target.value)}
              amount={toAmount}
              disabled
            />
            {showToDropdown && <CurrencyDropdown onSelect={handleToCurrencySelect} />}
          </div>
        </div>

        <div className='p-2 pb-4'>
          <button className='bg-zinc-300 py-2 rounded-xl w-full'>Swap</button>
        </div>
      </div>
    </div>
  )
}

export default SwapInterface