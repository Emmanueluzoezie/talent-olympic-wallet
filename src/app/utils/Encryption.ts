import * as bip39 from 'bip39';
import CryptoJS from 'crypto-js';

export function encryptSecretKey(secretKey: string, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  });

  const encrypted = CryptoJS.AES.encrypt(secretKey, key.toString(), {
    iv: CryptoJS.lib.WordArray.random(128 / 8),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  const result = salt.toString() + encrypted.toString();

  return result;
}

export async function decryptSecretKey(encryptedSecretKey: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const saltLength = 32;
        const salt = CryptoJS.enc.Hex.parse(encryptedSecretKey.slice(0, saltLength));
        const encryptedData = encryptedSecretKey.slice(saltLength);

        const key = CryptoJS.PBKDF2(password, salt, {
          keySize: 256 / 32,
          iterations: 10000
        });

        const decrypted = CryptoJS.AES.decrypt(encryptedData, key.toString());
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

        if (decryptedStr && bip39.validateMnemonic(decryptedStr)) {
        } else {
          console.error('Invalid decryption result or not a valid mnemonic');
          reject(new Error('Invalid decryption result'));
        }
      } catch (error) {
        console.error('Decryption error:', error);
        reject(error);
      }
    }, 1000);
  });
}