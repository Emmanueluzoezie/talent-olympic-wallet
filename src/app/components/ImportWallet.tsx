import React, { useCallback, useState, useRef } from "react";
import { WalletCreationProps } from "../types/Components";
import * as bip39 from 'bip39';
import { Keypair } from "@solana/web3.js";
import { storeKeyPair } from "../utils/WalletStorage";
import CreatePassword from "./CreatePassword";
import SeedPhraseInput from "./SecretPhraseInput";

const ImportWallet: React.FC<WalletCreationProps> = ({ onKeySet, projectKey }) => {
    const [password, setPassword] = useState<string>('');
    const [secretPhrase, setSecretPhrase] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [step, setStep] = useState<'phrase' | 'password'>('phrase');
    const hiddenInputRef = useRef<HTMLInputElement>(null);
  
    const validateSeedPhrase = useCallback((phrase: string): boolean => {
      return bip39.validateMnemonic(phrase);
    }, []);
  
    const handlePhraseSubmit = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (validateSeedPhrase(secretPhrase)) {
        setStep('password');
        setError('');
      } else {
        setError('Invalid seed phrase. Please check and try again.');
      }
    }, [secretPhrase, validateSeedPhrase]);
  
    const handleImportWallet = useCallback(async (password: string) => {
      try {
        const seed = await bip39.mnemonicToSeed(secretPhrase);
        const keypair = Keypair.fromSeed(seed.slice(0, 32));
        await storeKeyPair(keypair, secretPhrase, password);
        onKeySet(keypair);
      } catch (error) {
        console.error('Failed to import wallet:', error);
        setError('Failed to import wallet. Please try again.');
      }
    }, [secretPhrase, onKeySet]);

    const handlePaste = useCallback(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
        document.execCommand('paste');
      }
    }, []);

    const handleHiddenInputPaste = useCallback((event: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedText = event.clipboardData.getData('text');
      setSecretPhrase(pastedText.trim());
      if (hiddenInputRef.current) {
        hiddenInputRef.current.blur();
      }
    }, []);
  
    return (
      <div className="import-wallet">
        {step === 'phrase' ? (
          <div>
            <div className='flex flex-col items-center px-8 justify-center pt-6 pb-10 w-full'>
              <h2 className="primary-text-color text-[18px] text-center font-bold">Import your Wallet</h2>
              <p className="secondary-text-color text-[14px] mt-4 text-center">Please enter your secret phrase to import your wallet.</p>
            </div>
            <div className="flex justify-end px-8 mb-2">
              <button 
                onClick={handlePaste}
                className="p-1 font-bold text-[12px] rounded button-bgcolor button-textcolor text-sm"
              >
                Paste
              </button>
            </div>
            <input
              ref={hiddenInputRef}
              type="text"
              className="opacity-0 h-0"
              onPaste={handleHiddenInputPaste}
            />
            <SeedPhraseInput seedPhrase={secretPhrase} onChange={setSecretPhrase} />
            {error && <p className="text-red-600 text-[12px] text-center mt-10">{error}</p>}
            <div className="flex justify-center px-6">
              <button 
                onClick={handlePhraseSubmit} 
                className="mt-4 w-full p-2 rounded button-bgcolor button-textcolor text-white"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <CreatePassword 
            setPassword={setPassword} 
            password={password} 
            projectKey={projectKey}
            onPasswordSet={handleImportWallet}
          />
        )}
      </div>
    );
  };

  export default ImportWallet;