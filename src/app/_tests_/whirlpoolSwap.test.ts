jest.mock('@solana/web3.js', () => {
  const original = jest.requireActual('@solana/web3.js');
  return {
    ...original,
    Connection: jest.fn(),
    PublicKey: jest.fn().mockImplementation((key) => ({
      toBase58: () => key,
      equals: jest.fn(),
      toBuffer: () => Buffer.from(key),
    })),
    Keypair: {
      generate: jest.fn().mockReturnValue({
        publicKey: { toBase58: () => 'mocked-public-key' },
        secretKey: new Uint8Array(32),
      }),
      fromSecretKey: jest.fn().mockImplementation((secretKey) => ({
        publicKey: { toBase58: () => 'mocked-public-key' },
        secretKey,
      })),
    },
    Transaction: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      feePayer: null,
    })),
    sendAndConfirmTransaction: jest.fn(),
  };
});

import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { WhirlpoolContext, PDAUtil, TickArrayUtil, buildWhirlpoolClient } from '@orca-so/whirlpools-sdk';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { encryptPassword } from '../utils/PasswordEncryption';
import { decryptSecretKey } from '../utils/Encryption';
import generateKeypairFromSeedPhrase from '../utils/getKeypair';
import { executeSwap } from '../utils/whirlpoolSwap';  // Adjust this import path as needed

jest.mock('@solana/web3.js');
jest.mock('@orca-so/whirlpools-sdk');
jest.mock('../utils/PasswordEncryption');
jest.mock('../utils/Encryption');
jest.mock('../utils/getKeypair');

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

describe('executeSwap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_PROJECT_KEY = 'test-project-key';
    mockLocalStorage.getItem
      .mockReturnValueOnce('encrypted-seed-phrase')
      .mockReturnValueOnce('wallet-public-key')
      .mockReturnValueOnce('encrypted-password');
    
    (encryptPassword.decrypt as jest.Mock).mockResolvedValue('decrypted-password');
    (decryptSecretKey as jest.Mock).mockResolvedValue('decrypted-seed-phrase');
    (generateKeypairFromSeedPhrase as jest.Mock).mockResolvedValue({ secretKey: new Uint8Array(32) });

    (WhirlpoolContext.from as jest.Mock).mockReturnValue({});
    (buildWhirlpoolClient as jest.Mock).mockReturnValue({
      getPool: jest.fn().mockResolvedValue({
        getTokenAInfo: () => ({ mint: new PublicKey('tokenA') }),
        getData: () => ({
          tickCurrentIndex: 0,
          tickSpacing: 64,
          tokenVaultA: new PublicKey('vaultA'),
          tokenVaultB: new PublicKey('vaultB'),
          tokenMintA: new PublicKey('tokenA')
        }),
        getAddress: () => new PublicKey('oracle')
      })
    });
    (PDAUtil.getWhirlpool as jest.Mock).mockReturnValue({ publicKey: new PublicKey('whirlpool') });
    (TickArrayUtil.getTickArrayPDAs as jest.Mock).mockReturnValue([
      { publicKey: new PublicKey('tickArray0') },
      { publicKey: new PublicKey('tickArray1') },
      { publicKey: new PublicKey('tickArray2') }
    ]);
  });

  it('should execute a swap successfully', async () => {
    const connection = new Connection('') as jest.Mocked<Connection>;
    const publicKey = new PublicKey('test-public-key');
    const programId = new PublicKey('test-program-id');
    const fromTokenAddress = new PublicKey('from-token');
    const toTokenAddress = new PublicKey('to-token');
    const amount = '100';

    (sendAndConfirmTransaction as jest.Mock).mockResolvedValue('test-signature');

    const result = await executeSwap(
      connection,
      publicKey,
      programId,
      fromTokenAddress,
      toTokenAddress,
      amount
    );

    expect(result).toBe('test-signature');
    expect(sendAndConfirmTransaction).toHaveBeenCalled();
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(3);
    expect(encryptPassword.decrypt).toHaveBeenCalled();
    expect(decryptSecretKey).toHaveBeenCalled();
    expect(generateKeypairFromSeedPhrase).toHaveBeenCalled();
    expect(WhirlpoolContext.from).toHaveBeenCalled();
    expect(buildWhirlpoolClient).toHaveBeenCalled();
  });

  it('should throw an error if wallet information is missing', async () => {
    mockLocalStorage.getItem.mockReset().mockReturnValue(null);

    await expect(executeSwap(
      {} as Connection,
      {} as PublicKey,
      {} as PublicKey,
      {} as PublicKey,
      {} as PublicKey,
      '100'
    )).rejects.toThrow('Wallet information not found in localStorage');
  });

  it('should throw an error if project ID is missing', async () => {
    process.env.NEXT_PUBLIC_PROJECT_KEY = undefined;
    mockLocalStorage.getItem
      .mockReturnValueOnce('encrypted-seed-phrase')
      .mockReturnValueOnce('wallet-public-key')
      .mockReturnValueOnce('encrypted-password');
  
    await expect(executeSwap(
      {} as Connection,
      {} as PublicKey,
      {} as PublicKey,
      {} as PublicKey,
      {} as PublicKey,
      '100'
    )).rejects.toThrow('There was an error getting the project ID');
  });
});