import React, { useState, useEffect } from 'react'
import { walletInterface } from '../lib/WalletInterface';

const Setting = () => {
  const [network, setNetwork] = useState<'devnet' | 'mainnet-beta'>(walletInterface.getNetwork() as 'devnet' | 'mainnet-beta');

  const handleNetworkChange = (newNetwork: 'devnet' | 'mainnet-beta') => {
    setNetwork(newNetwork);
    walletInterface.setNetwork(newNetwork);
  };

  useEffect(() => {
    // Update the network in the walletInterface when it changes
    walletInterface.setNetwork(network);
  }, [network]);

  return (
    <div className='h-[500px] p-4'>
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Network</label>
        <select
          value={network}
          onChange={(e) => handleNetworkChange(e.target.value as 'devnet' | 'mainnet-beta')}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="devnet">Devnet</option>
          <option value="mainnet-beta">Mainnet</option>
        </select>
      </div>
      {/* Add more settings here as needed */}
    </div>
  )
}

export default Setting