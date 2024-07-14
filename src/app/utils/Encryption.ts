import * as bip39 from 'bip39';
import CryptoJS from 'crypto-js';

export function encryptSecretKey(secretKey: string, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  });

  const encrypted = CryptoJS.AES.encrypt(secretKey, key, {
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
        const bytes = CryptoJS.AES.decrypt(encryptedSecretKey, password);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted && bip39.validateMnemonic(decrypted)) {
          resolve(decrypted);
        } else {
          reject(new Error('Invalid decryption result'));
        }
      } catch (error) {
        reject(error);
      }
    }, 1000);
  });
}