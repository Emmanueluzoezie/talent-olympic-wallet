import React from 'react';
import { IoMdArrowBack } from 'react-icons/io';
import { MdContentCopy } from 'react-icons/md';
import QRCode from 'qrcode.react';
import { useWallet } from '../hook/useWallet';

interface AddressActionsProps {
  onBack: () => void;
  mode: 'send' | 'receive';
}

const AddressActions: React.FC<AddressActionsProps> = ({ onBack, mode }) => {
  const { publicKey } = useWallet();
  const address = publicKey?.toString() || '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="h-[500px] flex flex-col p-4">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="mr-4 primary-text-color">
          <IoMdArrowBack size={24} />
        </button>
        <h2 className="text-xl font-bold primary-text-color">{mode === 'send' ? 'Send' : 'Receive'}</h2>
      </div>

      {mode === 'receive' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-6">
            <QRCode value={address} size={200} />
          </div>
          
          <div className="mb-4 text-center">
            <p className="text-sm mb-2">Your wallet address:</p>
            <p className="font-mono bg-gray-100 p-2 rounded text-xs break-all">{address}</p>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded"
          >
            <MdContentCopy className="mr-2" /> Copy Address
          </button>
        </div>
      )}

      {mode === 'send' && (
        <div className="flex-1">
          {/* Implement send functionality here */}
          <p>Send functionality to be implemented</p>
        </div>
      )}
    </div>
  );
};

export default AddressActions;