import * as bip39 from 'bip39';
import CryptoJS from 'crypto-js';
import { decryptSecretKey, encryptSecretKey } from '../utils/Encryption';

jest.mock('bip39');
jest.mock('crypto-js');

describe('Encryption', () => {
  const mockSecretKey = 'test secret key';
  const mockPassword = 'test password';
  const mockEncryptedKey = 'encrypted key';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('encryptSecretKey', () => {
    it('should encrypt the secret key', () => {
      const mockSalt = { toString: jest.fn().mockReturnValue('salt') };
      const mockKey = 'derived key';
      const mockIv = { toString: jest.fn().mockReturnValue('iv') };
      const mockEncrypted = { toString: jest.fn().mockReturnValue('encrypted') };

      (CryptoJS.lib.WordArray.random as jest.Mock)
        .mockReturnValueOnce(mockSalt)
        .mockReturnValueOnce(mockIv);
      (CryptoJS.PBKDF2 as jest.Mock).mockReturnValue(mockKey);
      (CryptoJS.AES.encrypt as jest.Mock).mockReturnValue(mockEncrypted);

      const result = encryptSecretKey(mockSecretKey, mockPassword);

      expect(CryptoJS.PBKDF2).toHaveBeenCalledWith(mockPassword, mockSalt, {
        keySize: 256 / 32,
        iterations: 10000
      });
      expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(mockSecretKey, mockKey, {
        iv: mockIv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      expect(result).toBe('saltencrypted');
    });
  });

  describe('decryptSecretKey', () => {
    it('should decrypt the secret key successfully', async () => {
      const mockDecrypted = 'decrypted';
      (CryptoJS.AES.decrypt as jest.Mock).mockReturnValue({
        toString: jest.fn().mockReturnValue(mockDecrypted)
      });
      (bip39.validateMnemonic as jest.Mock).mockReturnValue(true);

      await expect(decryptSecretKey(mockEncryptedKey, mockPassword)).resolves.toBe(mockDecrypted);
      expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith(mockEncryptedKey, mockPassword);
      expect(bip39.validateMnemonic).toHaveBeenCalledWith(mockDecrypted);
    });

    it('should throw an error if decryption result is invalid', async () => {
      (CryptoJS.AES.decrypt as jest.Mock).mockReturnValue({
        toString: jest.fn().mockReturnValue('invalid')
      });
      (bip39.validateMnemonic as jest.Mock).mockReturnValue(false);

      await expect(decryptSecretKey(mockEncryptedKey, mockPassword)).rejects.toThrow('Invalid decryption result');
    });

    it('should throw an error if decryption fails', async () => {
      const mockError = new Error('Decryption failed');
      (CryptoJS.AES.decrypt as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      await expect(decryptSecretKey(mockEncryptedKey, mockPassword)).rejects.toThrow(mockError);
    });
  });
});