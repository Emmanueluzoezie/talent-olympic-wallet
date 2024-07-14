import { Keypair } from "@solana/web3.js";
import { encryptSecretKey } from "../utils/Encryption";
import { storeKeyPair } from "../utils/WalletStorage";

// Mock the dependencies
jest.mock("@solana/web3.js");
jest.mock("../utils/Encryption");

// Mock localStorage
const localStorageMock = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('WalletStorage', () => {
  // Mock console.error to prevent actual console output during tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should store keypair successfully', async () => {
    const mockKeypair = {
      publicKey: {
        toString: jest.fn().mockReturnValue('mockPublicKey'),
      },
    } as unknown as Keypair;
    const mockSeedPhrase = 'mock seed phrase';
    const mockPassword = 'mockPassword';
    const mockEncryptedSeedPhrase = 'encryptedSeedPhrase';

    (encryptSecretKey as jest.Mock).mockResolvedValue(mockEncryptedSeedPhrase);

    await storeKeyPair(mockKeypair, mockSeedPhrase, mockPassword);

    expect(encryptSecretKey).toHaveBeenCalledWith(mockSeedPhrase, mockPassword);
    expect(localStorage.setItem).toHaveBeenCalledWith('walletPublicKey', 'mockPublicKey');
    expect(localStorage.setItem).toHaveBeenCalledWith('encryptedSeedPhrase', mockEncryptedSeedPhrase);
  });

  it('should throw error if encryption fails', async () => {
    const mockKeypair = {
      publicKey: {
        toString: jest.fn().mockReturnValue('mockPublicKey'),
      },
    } as unknown as Keypair;
    const mockSeedPhrase = 'mock seed phrase';
    const mockPassword = 'mockPassword';
    const mockError = new Error('Encryption failed');

    (encryptSecretKey as jest.Mock).mockRejectedValue(mockError);

    await expect(storeKeyPair(mockKeypair, mockSeedPhrase, mockPassword)).rejects.toThrow('Encryption failed');
    expect(console.error).toHaveBeenCalledWith("Failed to encrypt seed phrase:", mockError);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});