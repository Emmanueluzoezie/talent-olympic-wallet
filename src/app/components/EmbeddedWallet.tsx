"use client"
import React, { useState, MouseEvent, useCallback, useEffect } from 'react';
import { useWallet } from '../hook/useWallet';
import WalletScreen from './WalletScreen';
import SwapInterface from './SwapInterface';
import Setting from './Setting';
import Button from './Button';
import { RiSwap2Fill, RiArrowDownSLine } from "react-icons/ri";
import { PiWalletBold } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";
import WalletSetup from './WalletSetup';
import { Keypair } from '@solana/web3.js';
import { walletInterface } from '../lib/WalletInterface';
import { useTheme } from '../context/ThemeContext';

interface EmbeddedWalletProps {
  mode: 'standalone' | 'embedded';
  mainnetRpcEndpoint: string;
  devnetRpcEndpoint: string;
  projectKey: string;
}

const EmbeddedWallet: React.FC<EmbeddedWalletProps> = ({ 
  mode, 
  mainnetRpcEndpoint, 
  devnetRpcEndpoint, 
  projectKey 
}) => {
  const [activeComponent, setActiveComponent] = useState<'setup' | 'wallet' | 'swap' | 'setting' | 'add'>('setup');
  const [showMenu, setShowMenu] = useState(false);
  const { isConnected, connect, disconnect, network, changeNetwork } = useWallet();
  const { primaryColor, secondaryColor } = useTheme();

  useEffect(() => {
    const currentRpcEndpoint = network === 'mainnet-beta' ? mainnetRpcEndpoint : devnetRpcEndpoint;
    walletInterface.setRpcEndpoint(currentRpcEndpoint);
  }, [network, mainnetRpcEndpoint, devnetRpcEndpoint]);

  const handleSetActiveComponent = (component: 'wallet' | 'swap' | 'setting' | 'add') => {
    setActiveComponent(component);
    setShowMenu(false);
  };

  const handleConnect = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleDisconnect = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    disconnect();
  };

  const handleKeySet = useCallback((keypair: Keypair) => {
    setActiveComponent("wallet")
    connect(keypair.publicKey.toString(), keypair);
  }, [connect]);

  const handleNetworkChange = useCallback((newNetwork: 'devnet' | 'mainnet-beta') => {
    changeNetwork(newNetwork);
  }, [changeNetwork]);

  const renderContent = () => {
    switch (activeComponent) {
      case 'setup':
        return <WalletSetup onKeySet={handleKeySet} projectKey={projectKey} />;
      case 'wallet':
        return <WalletScreen activeComponent={activeComponent} setActiveComponent={handleSetActiveComponent} />;
      case 'swap':
        return <SwapInterface />;
      case 'setting':
        return <Setting network={network as 'devnet' | 'mainnet-beta'} onNetworkChange={handleNetworkChange} />;
      case 'add':
        // Handle 'add' case if needed
        return null;
    }
  };

  const renderNavigation = () => (
    <div className="relative mb-4">
      <button 
        onClick={() => setShowMenu(!showMenu)} 
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left primary-text-color hover:backgroundColor rounded-md focus:outline-none focus-visible:ring focus-visible:backgroundColor focus-visible:ring-opacity-75"
      >
        <span>{activeComponent.charAt(0).toUpperCase() + activeComponent.slice(1)}</span>
        <RiArrowDownSLine
          className={`${showMenu ? 'transform rotate-180' : ''} w-5 h-5 text-gray-500`}
        />
      </button>
      {showMenu && (
        <div className="absolute z-10 w-full mt-2 origin-top-right primary-text-color rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1 layer-color rounded ">
            <button
              onClick={() => handleSetActiveComponent('wallet')}
              className="flex items-center w-full px-4 py-2 text-sm primary-text-color hover:backgroundColor"
            >
              <PiWalletBold className="mr-3 h-5 w-5" /> Wallet
            </button>
            <button
              onClick={() => handleSetActiveComponent('swap')}
              className="flex items-center w-full px-4 py-2 text-sm primary-text-color hover:backgroundColor"
            >
              <RiSwap2Fill className="mr-3 h-5 w-5" /> Swap
            </button>
            <button
              onClick={() => handleSetActiveComponent('setting')}
              className="flex items-center w-full px-4 py-2 text-sm primary-text-color hover:backgroundColor"
            >
              <IoSettingsOutline className="mr-3 h-5 w-5" /> Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const standaloneWallet = (
    <div className="standalone-wallet" style={{ backgroundColor: primaryColor, color: secondaryColor }}>
      <div className="wallet-header">
        <h1>Solana Wallet</h1>
        {isConnected ? (
          <button onClick={handleDisconnect}>Disconnect</button>
        ) : (
          <button onClick={handleConnect}>Connect</button>
        )}
      </div>
      <div className="wallet-content">
        {renderContent()}
      </div>
      {isConnected && activeComponent !== 'setup' && (
        <div className="wallet-footer">
          <Button 
            title='Wallet' 
            setActiveComponent={() => handleSetActiveComponent('wallet')} 
            Icon={PiWalletBold} 
            activeComponent={activeComponent} 
          />
          <Button 
            title='Swap' 
            setActiveComponent={() => handleSetActiveComponent('swap')} 
            Icon={RiSwap2Fill} 
            activeComponent={activeComponent} 
          />
          <Button 
            title='Setting' 
            setActiveComponent={() => handleSetActiveComponent('setting')} 
            Icon={IoSettingsOutline} 
            activeComponent={activeComponent} 
          />
        </div>
      )}
    </div>
  );

  const embeddedWallet = (
    <div className="embedded-wallet p-4 rounded-lg shadow-md" style={{ backgroundColor: primaryColor, color: secondaryColor }}>
      {isConnected ? (
        <div className="wallet-mini-content">
          {renderNavigation()}
          {renderContent()}
          {/* <button 
            onClick={handleDisconnect}
            className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          >
            Disconnect
          </button> */}
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );

  return mode === 'standalone' ? standaloneWallet : embeddedWallet;
};

export default EmbeddedWallet;