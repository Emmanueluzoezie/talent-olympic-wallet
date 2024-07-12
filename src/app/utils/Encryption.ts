import * as crypto from 'crypto';

// export async function encryptSecretKey(secretKey: string, password: string): Promise<string> {
//   const iv = crypto.randomBytes(this.ivLength);
//   const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
//   let encrypted = cipher.update(text, 'utf8', 'hex');
//   encrypted += cipher.final('hex');
//   return `${iv.toString('hex')}:${encrypted}`;
//   }


//   export async function decryptSecretKey(encryptedData: string, password: string): Promise<string> {
//     const passwordKey = await deriveKey(password);
//     const encryptedDataBuf = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
//     const iv = encryptedDataBuf.slice(0, 12);
//     const data = encryptedDataBuf.slice(12);
  
//     const decryptedContent = await crypto.subtle.decrypt(
//       { name: "AES-GCM", iv: iv },
//       passwordKey,
//       data
//     );
  
//     const decoder = new TextDecoder();
//     return decoder.decode(decryptedContent);
//   }
  

//   async function deriveKey(password: string): Promise<CryptoKey> {
//     console.log("password",)
//     const encoder = new TextEncoder();
//     const passwordKey = await crypto.subtle.importKey(
//       "raw",
//       encoder.encode(password),
//       "PBKDF2",
//       false,
//       ["deriveKey"]
//     );
  
//     return crypto.subtle.deriveKey(
//       {
//         name: "PBKDF2",
//         salt: encoder.encode("SomeRandomSaltValue"),
//         iterations: 100000,
//         hash: "SHA-256"
//       },
//       passwordKey, 
//       { name: "AES-GCM", length: 256 },
//       false,
//       ["encrypt", "decrypt"]
//     );
//   }


  // export class EncryptionService {
  //   private algorithm = 'aes-256-cbc';
  //   private ivLength = 16;
    
  //   encryptSecretKey(seedPhrase: string, password: string): string {
  //     const key = Buffer.from(password, 'hex');
  //     const iv = crypto.randomBytes(this.ivLength);
  //     const cipher = crypto.createCipheriv(this.algorithm, key, iv);
  //     let encrypted = cipher.update(seedPhrase, 'utf8', 'hex');
  //     encrypted += cipher.final('hex');
  //     return `${iv.toString('hex')}:${encrypted}`;
  //   }
  
  //   // decrypt(text: string): string {
  //   //   const [iv, encryptedText] = text.split(':');
  //   //   const decipher = crypto.createDecipheriv(this.algorithm, key, Buffer.from(iv, 'hex'));
  //   //   let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  //   //   decrypted += decipher.final('utf8');
  //   //   return decrypted;
  //   // }
  // }

  // export const encryption = new EncryptionService()

  import { Keypair } from '@solana/web3.js';
  import * as bip39 from 'bip39';
  import CryptoJS from 'crypto-js';

  export function encryptSecretKey(secretKey: string, password: string): string {
    // Generate a random salt
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
  
    // Use PBKDF2 to derive a key from the password
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000
    });
  
    // Encrypt the secret key
    const encrypted = CryptoJS.AES.encrypt(secretKey, key, {
      iv: CryptoJS.lib.WordArray.random(128 / 8),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
  
    // Combine the salt and encrypted data
    const result = salt.toString() + encrypted.toString();
  
    return result;
  }
  
  // Decrypt the secret key


  
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
      }, 1000); // Constant time delay to mitigate timing attacks
    });
  }