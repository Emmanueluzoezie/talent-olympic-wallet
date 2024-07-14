import * as crypto from 'crypto';
import { encryptPassword } from '../utils/PasswordEncryption';

jest.mock('crypto');

describe('EncryptPassword', () => {
  const mockText = 'testText';
  const mockPassword = 'testPassword';
  const mockIv = Buffer.from('0123456789abcdef');
  const mockEncrypted = 'encryptedText';
  const mockDecrypted = 'decryptedText';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('encrypt', () => {
    it('should encrypt the password', () => {
      const mockCipher = {
        update: jest.fn().mockReturnValue('partialEncrypted'),
        final: jest.fn().mockReturnValue('finalEncrypted')
      };

      (crypto.randomBytes as jest.Mock).mockReturnValue(mockIv);
      (crypto.createCipheriv as jest.Mock).mockReturnValue(mockCipher);

      const result = encryptPassword.encrypt(mockText, mockPassword);

      expect(crypto.randomBytes).toHaveBeenCalledWith(16);
      expect(crypto.createCipheriv).toHaveBeenCalledWith('aes-256-cbc', Buffer.from(mockText, 'hex'), mockIv);
      expect(mockCipher.update).toHaveBeenCalledWith(mockPassword, 'utf8', 'hex');
      expect(mockCipher.final).toHaveBeenCalledWith('hex');
      expect(result).toBe(`${mockIv.toString('hex')}:partialEncryptedfinalEncrypted`);
    });
  });

  describe('decrypt', () => {
    it('should decrypt the password', () => {
      const mockDecipher = {
        update: jest.fn().mockReturnValue('partialDecrypted'),
        final: jest.fn().mockReturnValue('finalDecrypted')
      };

      (crypto.createDecipheriv as jest.Mock).mockReturnValue(mockDecipher);

      const encryptedPassword = `${mockIv.toString('hex')}:${mockEncrypted}`;
      const result = encryptPassword.decrypt(mockText, encryptedPassword);

      expect(crypto.createDecipheriv).toHaveBeenCalledWith('aes-256-cbc', Buffer.from(mockText, 'hex'), mockIv);
      expect(mockDecipher.update).toHaveBeenCalledWith(mockEncrypted, 'hex', 'utf8');
      expect(mockDecipher.final).toHaveBeenCalledWith('utf8');
      expect(result).toBe('partialDecryptedfinalDecrypted');
    });
  });

  it('should correctly encrypt and decrypt', () => {
    const originalText = 'someSecretText';
    const password = 'somePassword';

    // Mock the crypto functions to simulate actual encryption/decryption
    (crypto.randomBytes as jest.Mock).mockReturnValue(mockIv);
    (crypto.createCipheriv as jest.Mock).mockImplementation(() => ({
      update: jest.fn().mockReturnValue('encrypted'),
      final: jest.fn().mockReturnValue('')
    }));
    (crypto.createDecipheriv as jest.Mock).mockImplementation(() => ({
      update: jest.fn().mockReturnValue('decrypted'),
      final: jest.fn().mockReturnValue('')
    }));

    const encrypted = encryptPassword.encrypt(originalText, password);
    const decrypted = encryptPassword.decrypt(originalText, encrypted);

    expect(decrypted).toBe('decrypted');
  });
});