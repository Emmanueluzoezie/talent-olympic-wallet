import React, { useState } from 'react'
import { useTokenContext } from '../context/TokenContext';

interface SettingProps {
  network: 'devnet' | 'mainnet-beta';
  onNetworkChange: (network: 'devnet' | 'mainnet-beta') => void;
}

const Setting: React.FC<SettingProps> = ({ network, onNetworkChange }) => {
  const [isChangingNetwork, setIsChangingNetwork] = useState(false);
  const { refreshTokenData } = useTokenContext();

  const handleNetworkChange = async (newNetwork: 'devnet' | 'mainnet-beta') => {
    setIsChangingNetwork(true);
    try {
      onNetworkChange(newNetwork);
      await refreshTokenData();
    } catch (error) {
      console.error("Error changing network:", error);
    } finally {
      setIsChangingNetwork(false);
    }
  };

  return (
    <div className='h-[500px] p-4 font-mono '>
      <h2 className="text-xl font-bold font-mono mb-4 primary-text-color">Settings</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium pl-4 secondary-text-color">Network</label>
        <select
          value={network}
          onChange={(e) => handleNetworkChange(e.target.value as 'devnet' | 'mainnet-beta')}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md backgroundColor"
          disabled={isChangingNetwork}
        >
          <option value="devnet">Devnet</option>
          <option value="mainnet-beta">Mainnet</option>
        </select>
      </div>
      {isChangingNetwork && <p className='secondary-text-color text-center'>Changing network, please wait...</p>}
    </div>
  )
}

export default Setting;