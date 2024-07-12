"use client"
import { useCallback, useEffect, useState } from "react";
import { WalletCreationProps } from "../types/Components";
import { Keypair } from "@solana/web3.js";
import * as bip39 from 'bip39';
import { storeKeyPair } from "../utils/WalletStorage";
import CreatePassword from "./CreatePassword";

const GenerateWallet: React.FC<WalletCreationProps> = ({ onKeySet, projectKey }) => {
    const [password, setPassword] = useState<string>('');
    const [secretPhrase, setSecretPhrase] = useState<string>('');
    const [confirmPhrase, setConfirmPhrase] = useState<string>('');
    const [step, setStep] = useState<'generate' | 'confirm' | 'password'>('generate');
    const [error, setError] = useState<string>('');
  
    useEffect(() => {
      if (step === 'generate') {
        handleGenerateNewKey();
      }
    }, []);
  
    const handleGenerateNewKey = useCallback(() => {
      const newKeypair = Keypair.generate();
      const secretKeyUint8 = newKeypair.secretKey;
      const entropy = Buffer.from(secretKeyUint8.slice(0, 16));
      const seedPhrase = bip39.entropyToMnemonic(entropy);
      setSecretPhrase(seedPhrase);
    }, []);
  
    const handleConfirmPhrase = useCallback(() => {
      if (confirmPhrase.trim() === secretPhrase.trim()) {
        setStep('password');
        setError('');
      } else {
        setError('The seed phrases do not match. Please try again.');
      }
    }, [confirmPhrase, secretPhrase]);
  
    const handleCreateWallet = useCallback(async (password: string) => {
      try {
        const seed = await bip39.mnemonicToSeed(secretPhrase);
        const newKeypair = Keypair.fromSeed(seed.slice(0, 32));
        await storeKeyPair(newKeypair, secretPhrase, password);
        onKeySet(newKeypair);
      } catch (error) {
        console.error('Failed to create wallet:', error);
        setError('Failed to create wallet. Please try again.');
      }
    }, [secretPhrase, onKeySet]);
  
    return (
      <div className="generate-wallet">
        {step === 'generate' && (
          <div>
            <h2>Your Secret Recovery Phrase</h2>
            <p>Write down these 12 words in order and keep them safe. Do not share them with anyone.</p>
            <textarea value={secretPhrase} readOnly rows={4} className="secret-phrase" />
            <button onClick={() => setStep('confirm')}>I've written it down</button>
          </div>
        )}
        {step === 'confirm' && (
          <div>
            <h2>Confirm Your Secret Recovery Phrase</h2>
            <p>Please enter your secret recovery phrase to confirm you've saved it.</p>
            <textarea
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              placeholder="Enter your seed phrase (12 words)"
              rows={4}
              className="confirm-phrase"
            />
            {error && <p className="error">{error}</p>}
            <button onClick={handleConfirmPhrase}>Confirm</button>
          </div>
        )}
        {step === 'password' && (
          <div>
            <CreatePassword 
              password={password} 
              setPassword={setPassword} 
              projectKey={projectKey}
              onPasswordSet={handleCreateWallet}
            />
            {error && <p className="error">{error}</p>}
          </div>
        )}
      </div>
    );
  };

export default GenerateWallet;