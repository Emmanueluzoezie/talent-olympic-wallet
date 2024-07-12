"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { EmbeddedWalletProps } from '../types/Components';
import { walletInterface } from '../lib/WalletInterface';
import WalletScreen from './WalletScreen';
import SwapInterface from './SwapInterface';
import WalletSetup from './WalletSetup';
import { Keypair } from '@solana/web3.js';
import Button from './Button';
import { RiSwap2Fill } from "react-icons/ri";
import { PiWalletBold } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";
import Setting from './Setting';

const EmbeddedWallet: React.FC<EmbeddedWalletProps> = ({ rpcEndpoint, apiKey, projectKey }) => {
  const [activeComponent, setActiveComponent] = useState<'setup' | 'wallet' | 'swap' | 'setting' | "add">('setup');

  useEffect(() => {
    if (rpcEndpoint) {
      walletInterface.setRpcEndpoint(rpcEndpoint, apiKey);
    }
  }, [rpcEndpoint, apiKey]);

  const handleKeySet = useCallback((keypair: Keypair) => {
    walletInterface.setPublicKey(keypair.publicKey.toString());
    walletInterface.setSigner(keypair);
    setActiveComponent('wallet');
  }, []);

  return (
    <div className="border-2">
      {activeComponent === 'setup' ? (
        <WalletSetup onKeySet={handleKeySet} projectKey={projectKey} />
      ) : (
        <>
          <div className="component-container">
            {activeComponent === 'setting' && <Setting />}
            {activeComponent === 'wallet' && <WalletScreen setActiveComponent={setActiveComponent} activeComponent={activeComponent}/>}
            {activeComponent === 'swap' && <SwapInterface />}
          </div>
          <div className="flex justify-around bg-zinc-400">
            <Button title='Wallet' setActiveComponent={setActiveComponent} Icon={PiWalletBold} activeComponent={activeComponent} />
            <Button title='Swap' setActiveComponent={setActiveComponent} Icon={RiSwap2Fill} activeComponent={activeComponent} />
            <Button title='Setting' setActiveComponent={setActiveComponent} Icon={IoSettingsOutline} activeComponent={activeComponent} />
          </div>
        </>
      )}
    </div>
  );
};
export default EmbeddedWallet