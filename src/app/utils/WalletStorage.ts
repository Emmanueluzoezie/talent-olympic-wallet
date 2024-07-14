import { Keypair } from "@solana/web3.js";
import { encryptSecretKey } from "./Encryption";
import { encryptPassword } from "./PasswordEncryption";

export const storeKeyPair = async (keypair: Keypair, seedPhrase: string, password: string) => {
  try {
    const encryptedSeedPhrase = await encryptSecretKey(seedPhrase, password);
    localStorage.setItem('walletPublicKey', keypair.publicKey.toString());
    localStorage.setItem('encryptedSeedPhrase', encryptedSeedPhrase);
  } catch (error) {
    console.error("Failed to encrypt seed phrase:", error);
    throw error;
  }
};

export const storePassword = async (projectKey: string, password: string) => {
  try {
    const encryptedPassword = encryptPassword.encrypt(projectKey, password);
    localStorage.setItem('encryptedPassword', encryptedPassword);
  } catch (error) {
    console.error("Failed to encrypt password:", error);
    throw error;
  }
};

