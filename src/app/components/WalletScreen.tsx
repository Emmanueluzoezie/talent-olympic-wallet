import React from 'react'
import { IoMdAdd } from "react-icons/io";
import { IoMdAddCircle } from "react-icons/io";
import { MdOutlineQrCode2 } from "react-icons/md";
import { WalletScreenProps } from '../types/Components';
import Token from './Token';

const WalletScreen: React.FC<WalletScreenProps> = ({activeComponent, setActiveComponent, }) =>{

  return (
    <div className='h-[500px] flex flex-col'>
      <div className='flex-1'>
        <div className='flex justify-between items-center p-2'>
          <button className='text-[26px]' 
          // onClick={() => setActiveComponent("add")}
          >
            <IoMdAddCircle />
          </button>
          <h2>Main</h2>
          <button className='text-[26px]'>
            <MdOutlineQrCode2 />
          </button>
        </div>
        <div>
          <h2 className='py-5 text-[40px] text-center'>$ 75899</h2>
          <div className='flex items-center space-x-4 px-4'>
            <button className='w-full bg-zinc-300 py-1'>Recieve</button>
            <button className='w-full bg-zinc-300 py-1'>Send</button>
          </div>
        </div>
      </div>
      <div className='h-[300px] px-3 border-2 overflow-scroll'>
        <Token />
        <Token />
        <Token />
        <Token />
        <Token />
        <Token />
      </div>
    </div>
  )
}

export default WalletScreen