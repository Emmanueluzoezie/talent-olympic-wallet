"use client"
import React from 'react'
import Image from 'next/image';
import { useTokenContext } from '../context/TokenContext';

const TokenDetails = () => {
  const { tokens, prices, balances } = useTokenContext();

  const formatPrice = (price: number) => {
    if (price === undefined) return 'N/A';
    return price < 0.01 ? price.toExponential(2) : price.toFixed(2);
  };

  return (
    <>
      {tokens.map(token => (
        <div key={token.symbol} className='border-2 h-[65px] my-4 rounded-md p-2'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center'>
              <Image 
                src={token.image ||""} 
                alt={token.name} 
                width={35} 
                height={35} 
                // onError={(e) => e.target.style.display = 'none'}
              />
              <div className='ml-2'>
                <h2 className='font-semibold'>{token.name}</h2>
                <h2 className='text-xs'>{token.symbol}</h2>
              </div>
            </div>
            <div className='flex flex-col items-center'>
              <h2 className='font-semibold'>
                {balances[token.symbol]?.toFixed(4) || '0'}
              </h2>
              <p className='text-xs'>
                ${formatPrice(prices[token.symbol])}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default TokenDetails