import React, { useState, useEffect, useCallback } from 'react';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import ImportWallet from './ImportWallet';
import GenerateWallet from './GenerateWallet';
import { WalletSetupProps } from '../types/Wallet';
import { decryptSecretKey } from '../utils/Encryption';

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

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

    if (!storedPublicKey || !encryptedSeedPhrase) {
      setError('No stored key found. Please create a new wallet or import an existing one.');
      return;
    }

    const currentTime = Date.now();
    if (currentTime - lastAttemptTime < LOCKOUT_TIME && attemptCount >= MAX_ATTEMPTS) {
      setError(`Too many failed attempts. Please try again in ${Math.ceil((LOCKOUT_TIME - (currentTime - lastAttemptTime)) / 60000)} minutes.`);
      return;
    }

    try {
      const decryptedSeedPhrase = await decryptSecretKey(encryptedSeedPhrase, password);
      const seed = await bip39.mnemonicToSeed(decryptedSeedPhrase);
      const keypair = Keypair.fromSeed(seed.slice(0, 32));
      onKeySet(keypair);
      setAttemptCount(0);
    } catch (error) {
      console.error('Failed to decrypt seed phrase:', error);
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      setLastAttemptTime(currentTime);
      if (newAttemptCount >= MAX_ATTEMPTS) {
        setError(`Maximum attempts reached. Please try again in ${LOCKOUT_TIME / 60000} minutes.`);
      } else {
        setError(`Incorrect password. ${MAX_ATTEMPTS - newAttemptCount} attempts remaining.`);
      }
    }
  }, [password, attemptCount, lastAttemptTime, onKeySet]);

  const renderStoredKeyMode = () => (
    <div>
      <p>Welcome Back</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
      />
      <button onClick={handleUseStoredKey}>Use Stored Key</button>
      {error && <p className="error">{error}</p>}
    </div>
  );

  const renderSetupOptions = () => (
    <div className="setup-options">
      <button onClick={() => setSetupMode('import')}>Import Existing Wallet</button>
      <button onClick={() => setSetupMode('generate')}>Generate New Wallet</button>
    </div>
  );

  return (
    <div className="border-2 h-[500px]">
      <h2>Wallet Setup</h2>
      {setupMode === 'stored' && renderStoredKeyMode()}
      {setupMode === null && renderSetupOptions()}
      {setupMode === 'import' && <ImportWallet onKeySet={onKeySet} projectKey={projectKey} />}
      {setupMode === 'generate' && <GenerateWallet onKeySet={onKeySet} projectKey={projectKey} />}
    </div>
  );
};

export default WalletSetup;