import { useCallback, useState } from "react";
import { WalletCreationProps } from "../types/Components";
import * as bip39 from 'bip39';
import { Keypair } from "@solana/web3.js";
import { storeKeyPair } from "../utils/WalletStorage";
import CreatePassword from "./CreatePassword";

const ImportWallet: React.FC<WalletCreationProps> = ({ onKeySet, projectKey }) => {
    const [password, setPassword] = useState<string>('');
    const [secretPhrase, setSecretPhrase] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [step, setStep] = useState<'phrase' | 'password'>('phrase');
  
    const validateSeedPhrase = useCallback((phrase: string): boolean => {
      return bip39.validateMnemonic(phrase);
    }, []);
  
    const handlePhraseSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
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
  
    return (
      <div className="import-wallet">
        {step === 'phrase' ? (
          <form onSubmit={handlePhraseSubmit}>
            <h2>Import Your Wallet</h2>
            <p>Enter your 12 or 24-word secret recovery phrase</p>
            <textarea
              value={secretPhrase}
              onChange={(e) => setSecretPhrase(e.target.value)}
              placeholder="Enter your seed phrase (12 or 24 words)"
              rows={4}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Continue</button>
          </form>
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

  export default ImportWallet