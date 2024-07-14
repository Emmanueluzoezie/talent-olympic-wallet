import React from 'react'
import { IoMdAdd } from "react-icons/io";
import { IoMdAddCircle } from "react-icons/io";
import { MdOutlineQrCode2 } from "react-icons/md";
import { WalletScreenProps } from '../types/Components';
import TokenDetails from './TokenDetails';
import { useTokenContext } from '../context/TokenContext';

const WalletScreen: React.FC<WalletScreenProps> = ({activeComponent, setActiveComponent, }) =>{
  const {totalBalanceInUSDC} = useTokenContext()

  return (
    <div className='h-[500px] flex flex-col'>
      <div className='flex-1'>
        <div className='flex justify-between items-center p-2'>
          <button className='text-[26px] primary-text-color' 
          // onClick={() => setActiveComponent("add")}
          >
            <IoMdAddCircle />
          </button>
          <h2 className='primary-text-color'>Account</h2>
          <button className='text-[26px] primary-text-color'>
            <MdOutlineQrCode2 />
          </button>
        </div>
        <div>
          <h2 className='pt-4 text-[14px] text-center secondary-text-color'>Total Balance</h2>
          <h2 className='pb-5 text-[35px] primary-text-color text-center'>$ {totalBalanceInUSDC}</h2>
          <div className='flex items-center space-x-4 px-4'>
            <button className='w-full bg-zinc-300 py-1 rounded font-semibold'>Recieve</button>
            <button className='w-full bg-zinc-300 py-1 rounded font-semibold'>Send</button>
          </div>
        </div>
      </div>
      <div className='h-[300px] px-3 overflow-scroll'>
        <TokenDetails />
      </div>
    </div>
  )
}

export default WalletScreen