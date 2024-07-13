import Image from 'next/image';
import React from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { CurrencyInputProps } from '../types/Components';
import { useTokenContext } from '../context/TokenContext';



const CurrencyInput: React.FC<CurrencyInputProps> = ({
  selectedCurrency,
  onCurrencyClick,
  onInputChange,
  amount,
  onMaxClick,
  inSufficient,
  disabled = false, }) => {
    const { balances } = useTokenContext();

  return (
    <div className="border-2 py-2 flex items-center justify-between relative">
      <div className="border-2 flex items-center space-x-2 px-3 py-1 cursor-pointer" onClick={onCurrencyClick}>
        <div className="w-8 h-8 border-2">
          <Image src={`${selectedCurrency.image}`} alt="Currency" className="w-full h-full" width={20} height={20} />
        </div>
        <h2 className="font-semibold px-2">{selectedCurrency.symbol}</h2>
        <IoIosArrowDown className="text-[20px]" />
      </div>
      <div className="flex flex-col items-center relative">
        {onMaxClick && (
          <div className=' absolute -top-5 flex justify-end w-[150px] pr-2 pb-1'>
            <button
              className="text-[10px] rounded-l"
              onClick={onMaxClick}
            >
             {balances[selectedCurrency.symbol]?.toFixed(4) || '0'} Max
            </button>
          </div>
        )}
        <input
          className={`border-2 text-[20px] font-semibold text-center w-[150px] outline-none ${onMaxClick ? 'rounded-r' : 'rounded'} ${disabled ? 'bg-gray-200' : ''}`}
          type="text"
          placeholder="0"
          value={amount}
          onChange={onInputChange}
          disabled={disabled}
        />
        {inSufficient && (
          <div className=' absolute -bottom-4 flex justify-end w-[150px]'>
            <h2 className='text-red-500 text-[10px] font-semibold'>Insufficient fund</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyInput;
