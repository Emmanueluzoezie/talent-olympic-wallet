import React, { useState, useEffect, useCallback } from 'react';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import ImportWallet from './ImportWallet';
import GenerateWallet from './GenerateWallet';
import { decryptSecretKey } from '../utils/Encryption';
import { encryptPassword } from '../utils/PasswordEncryption';
import SeedPhraseInput from './SecretPhraseInput';

// Define WalletSetupProps type
interface WalletSetupProps {
  onKeySet: (keypair: Keypair) => void;
  projectKey: string;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

const WalletSetup: React.FC<WalletSetupProps> = ({ onKeySet, projectKey }) => {
  const [setupMode, setSetupMode] = useState<'stored' | 'import' | 'generate' | null>(null);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);

  useEffect(() => {
    const storedPublicKey = localStorage.getItem('walletPublicKey');
    setSetupMode(storedPublicKey ? 'stored' : null);
  }, []);

  const handleUseStoredKey = useCallback(async () => {

    const storedPublicKey = localStorage.getItem('walletPublicKey');
    const encryptedSeedPhrase = localStorage.getItem('encryptedSeedPhrase');
    const encryptedPassword = localStorage.getItem('encryptedPassword');

    if (!storedPublicKey || !encryptedSeedPhrase || !encryptedPassword) {
        console.error('Missing required data in localStorage');
        setError('No stored key or password found. Please create a new wallet or import an existing one.');
        return;
    }

    const currentTime = Date.now();
    if (currentTime - lastAttemptTime < LOCKOUT_TIME && attemptCount >= MAX_ATTEMPTS) {
        setError(`Too many failed attempts. Please try again in ${Math.ceil((LOCKOUT_TIME - (currentTime - lastAttemptTime)) / 60000)} minutes.`);
        return;
    }

    try {
        const decryptedStoredPassword = encryptPassword.decrypt(projectKey, encryptedPassword);
        if (password !== decryptedStoredPassword) {
            console.error("Password mismatch");
            throw new Error('Incorrect password');
        }

        const decryptedSeedPhrase = await decryptSecretKey(encryptedSeedPhrase, password);

        if (!bip39.validateMnemonic(decryptedSeedPhrase)) {
          console.error("Invalid seed phrase");
          throw new Error('Invalid seed phrase');
      }
      const seed = await bip39.mnemonicToSeed(decryptedSeedPhrase);
      const keypair = Keypair.fromSeed(seed.slice(0, 32));
      
      onKeySet(keypair);
        if (keypair.publicKey.toString() !== storedPublicKey) {
            console.error("Public key mismatch");
            throw new Error('Generated public key does not match stored key');
        }
        setAttemptCount(0);

    } catch (error) {
        console.error('Failed to decrypt or validate:', error);
        
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        setLastAttemptTime(currentTime);

        if (newAttemptCount >= MAX_ATTEMPTS) {
            setError(`Maximum attempts reached. Please try again in ${LOCKOUT_TIME / 60000} minutes.`);
        } else {
            setError(`Incorrect password or invalid data. ${MAX_ATTEMPTS - newAttemptCount} attempts remaining.`);
        }

        if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
        }
    }
  }, [password, attemptCount, lastAttemptTime, onKeySet, projectKey]);

  const renderStoredKeyMode = () => (
    <div>
      <div className='px-6'>
        <h2 className='primary-text-color font-semibold text-[22px] pt-10 pb-6'>Welcome back</h2>
        <h2 className='pb-36 secondary-text-color font-semibold text-center text-[18px]'>Enter your password</h2>
        <label  className='primary-text-color pl-3 text-[14px]'>Password: </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className='w-full p-2 outline-none rounded text-black'
        />
      </div>
      {error && <p className='text-red-600 pl-6 text-[14px]'>{error}</p>}
      <div className='flex justify-center px-6 mt-10'>
        <button 
          // disabled={password.length <= 0} 
          className={`p-2 w-full rounded ${password.length > 0 ? "button-bgcolor button-textcolor" : "layer-color text-zinc-600"}`} 
          onClick={handleUseStoredKey}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderSetupOptions = () => (
    <div className="relative h-full">
      <h2 className='primary-text-color text-[25px] font-bold text-center py-10'>Set up your wallet</h2>
      <div className='absolute bottom-0 w-full flex justify-center flex-col items-center p-6 space-y-4'>
        <button 
          className='w-full button-bgcolor button-textcolor py-2 rounded font-semibold' 
          onClick={() => setSetupMode('generate')}
        >
          Generate New Wallet
        </button>
        <button 
          className='w-full primary-text-color underline-[#A9A9A9] underline' 
          onClick={() => setSetupMode('import')}
        >
          Import Existing Wallet
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-[500px] w-full">
      {setupMode === 'stored' && renderStoredKeyMode()}
      {setupMode === null && renderSetupOptions()}
      {setupMode === 'import' && <ImportWallet onKeySet={onKeySet} projectKey={projectKey} />}
      {setupMode === 'generate' && <GenerateWallet onKeySet={onKeySet} projectKey={projectKey} />}
    </div>
  );
};

export default WalletSetup;