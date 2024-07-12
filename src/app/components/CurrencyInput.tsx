import Image from 'next/image';
import React from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { CurrencyInputProps } from '../types/Components';



const CurrencyInput: React.FC<CurrencyInputProps> = ({ selectedCurrency,
    onCurrencyClick,
    onInputChange,
    amount,
    onMaxClick,
    disabled = false,}) => {

  return (
    <div className="border-2 py-2 flex items-center justify-between relative">
    <div className="border-2 flex items-center space-x-2 px-3 py-1 cursor-pointer" onClick={onCurrencyClick}>
      <div className="w-8 h-8 border-2">
        <Image src="https://pbs.twimg.com/profile_images/1472933274209107976/6u-LQfjG_400x400.jpg" alt="Currency" className="w-full h-full" width={20} height={20} />
      </div>
      <h2 className="font-semibold px-2">{selectedCurrency}</h2>
      <IoIosArrowDown className="text-[20px]" />
    </div>
    <div className="flex flex-col items-center">
      {onMaxClick && (
        <div className='flex justify-end w-[150px] pr-2 pb-1'>
            <button
          className="border-2 text-[10px] rounded-l"
          onClick={onMaxClick}
        >
          Max
        </button>
        </div>
      )}
      <input
        className={`border-2 text-[20px] font-semibold text-center w-[150px] ${onMaxClick ? 'rounded-r' : 'rounded'} ${disabled ? 'bg-gray-200' : ''}`}
        type="text"
        placeholder="0"
        value={amount}
        onChange={onInputChange}
        disabled={disabled}
      />
    </div>
  </div>
  );
};

export default CurrencyInput;
