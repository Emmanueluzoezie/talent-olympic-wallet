"use client"
import { useCallback, useEffect, useState } from "react";
import { WalletCreationProps } from "../types/Components";
import { Keypair } from "@solana/web3.js";
import * as bip39 from 'bip39';
import { storeKeyPair } from "../utils/WalletStorage";
import CreatePassword from "./CreatePassword";
import SeedPhraseInput from "./SecretPhraseInput";

const GenerateWallet: React.FC<WalletCreationProps> = ({ onKeySet, projectKey }) => {
  const [password, setPassword] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(secretPhrase).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  const isConfirmPhraseComplete = confirmPhrase.split(' ').filter(word => word.trim() !== '').length === 12;

  return (
    <div className="w-full">
      {step === 'generate' && (
        <div>
          <div className='flex flex-col items-center px-8 justify-center pt-6 pb-16 w-full'>
            <h2 className="primary-text-color text-[22px] text-center font-bold">Your Secret Recovery Phrase</h2>
            <p className="secondary-text-color text-[12px] mt-2 text-center">Write down these 12 words in order and keep them safe. Do not share them with anyone.</p>
          </div>
          <SeedPhraseInput seedPhrase={secretPhrase} onChange={setSecretPhrase} disable={true} />
          <div className="flex justify-end px-8 pt-4">
          <button 
              onClick={handleCopy}
              className="button-bgcolor button-textcolor px-2 py-[1px] rounded text-[12px]"
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="px-8">
            <div className="mt-6 flex items-center space-x-2 px-4">
              <input
                type="checkbox"
                id="confirmCheckbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="confirmCheckbox" className="text-[14px] primary-text-color">
                I've written down my secret phrase
              </label>
            </div>
            <button
              onClick={() => setStep('confirm')}
              disabled={!isConfirmed}
              className={`mt-4 w-full p-2 rounded ${isConfirmed ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-500'}`}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      {step === 'confirm' && (
        <div>
           <div className='flex flex-col items-center px-8 justify-center pt-6 pb-16 w-full'>
            <h2 className="primary-text-color text-[18px] text-center font-bold">Confirm Your Secret Recovery Phrase</h2>
            <p className="secondary-text-color text-[14px] mt-4 text-center">Please enter your secret recovery phrase to confirm you've saved it.</p>
          </div>
          <SeedPhraseInput seedPhrase={confirmPhrase} onChange={setConfirmPhrase} />
          {error && <p className="error">{error}</p>}
          {isConfirmPhraseComplete && (
            <div className="flex justify-center px-8 mt-16">
              <button 
              onClick={handleConfirmPhrase}
              className="mt-4 w-full p-2 rounded button-bgcolor button-textcolor font-semibold text-white"
            >
              Confirm
            </button>
            </div>
          )}
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