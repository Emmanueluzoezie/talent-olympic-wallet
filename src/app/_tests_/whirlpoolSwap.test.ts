// whirlpoolSwap.test.ts

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as web3 from '@solana/web3.js';
import { encryptPassword } from '../utils/PasswordEncryption';
import { decryptSecretKey } from '../utils/Encryption';
import generateKeypairFromSeedPhrase from '../utils/getKeypair';
import { executeSwap } from '../utils/whirlpoolSwap';

// Mocking dependencies
jest.mock('@solana/web3.js', () => {
  const actual = jest.requireActual('@solana/web3.js');
  return {
    ...actual,
    PublicKey: jest.fn().mockImplementation((key) => ({
      toBase58: () => key,
      equals: jest.fn().mockReturnValue(true),
      toString: () => key,
    })),
    sendAndConfirmTransaction: jest.fn().mockResolvedValue('mockSignature'),
    Keypair: {
      fromSecretKey: jest.fn().mockReturnValue({
        publicKey: { toBase58: () => 'mockPublicKey' },
      }),
    },
  };
});

jest.mock('@project-serum/anchor', () => ({
  Program: jest.fn().mockReturnValue({
    methods: {
      swap: jest.fn().mockReturnValue({
        accounts: jest.fn().mockReturnValue({
          instruction: jest.fn().mockResolvedValue('mockInstruction'),
        }),
      }),
    },
  }),
  AnchorProvider: {
    defaultOptions: jest.fn().mockReturnValue({}),
  },
  web3: {
    Keypair: {
      generate: jest.fn().mockReturnValue({ publicKey: new web3.PublicKey('mockPublicKey') }),
    },
  },
}));

jest.mock('@orca-so/whirlpools-sdk', () => ({
  WhirlpoolContext: {
    from: jest.fn().mockReturnValue({
      getPool: jest.fn().mockResolvedValue({
        getData: jest.fn().mockReturnValue({
          tickCurrentIndex: 0,
          tickSpacing: 1,
          tokenVaultA: new web3.PublicKey('vaultA'),
          tokenVaultB: new web3.PublicKey('vaultB'),
          tokenMintA: new web3.PublicKey('mintA'),
        }),
        getTokenAInfo: jest.fn().mockReturnValue({ mint: new web3.PublicKey('mintA') }),
        getAddress: jest.fn().mockReturnValue(new web3.PublicKey('address')),
      }),
    }),
  },
  PDAUtil: {
    getWhirlpool: jest.fn().mockReturnValue({ publicKey: new web3.PublicKey('whirlpool') }),
  },
  TickArrayUtil: {
    getTickArrayPDAs: jest.fn().mockReturnValue([
      { publicKey: new web3.PublicKey('tickArray0') },
      { publicKey: new web3.PublicKey('tickArray1') },
      { publicKey: new web3.PublicKey('tickArray2') },
    ]),
  },
  buildWhirlpoolClient: jest.fn().mockReturnValue({}),
}));

jest.mock('@solana/spl-token', () => ({
  TOKEN_PROGRAM_ID: new web3.PublicKey('tokenProgramId'),
}));

jest.mock('../utils/PasswordEncryption');
jest.mock('../utils/Encryption');
jest.mock('../utils/getKeypair');

describe('whirlpoolSwap', () => {
  // Setup mock data
  const mockConnection = {} as Connection;
  const mockPublicKey = new web3.PublicKey('11111111111111111111111111111111');
  const mockProgramId = new web3.PublicKey('22222222222222222222222222222222');
  const mockFromTokenAddress = new web3.PublicKey('33333333333333333333333333333333');
  const mockToTokenAddress = new web3.PublicKey('44444444444444444444444444444444');
  const mockAmount = '10';
  const mockSeedPhrase = 'test seed phrase';
  const mockPassword = 'testPassword';
  const mockEncryptedPassword = 'encryptedPassword';
  const mockEncryptedSeedPhrase = 'encryptedSeedPhrase';
  const mockProjectId = 'testProjectId';

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockImplementation((key) => {
          if (key === 'encryptedSeedPhrase') return mockEncryptedSeedPhrase;
          if (key === 'walletPublicKey') return mockPublicKey.toString();
          if (key === 'encryptedPassword') return mockEncryptedPassword;
          return null;
        }),
        setItem: jest.fn(),
      },
      writable: true,
    });

    // Setup environment variable mock
    process.env.NEXT_PUBLIC_PROJECT_KEY = mockProjectId;

    // Mock the encryption/decryption functions
    (encryptPassword.decrypt as jest.Mock).mockResolvedValue(mockPassword);
    (decryptSecretKey as jest.Mock).mockResolvedValue(mockSeedPhrase);

    // Mock the generateKeypairFromSeedPhrase function
    (generateKeypairFromSeedPhrase as jest.Mock).mockResolvedValue(Keypair.generate());
  });

  it('should execute a swap successfully', async () => {
    const signature = await executeSwap(
      mockConnection,
      mockPublicKey,
      mockProgramId,
      mockFromTokenAddress,
      mockToTokenAddress,
      mockAmount
    );

    expect(signature).toBe('mockSignature');
    expect(localStorage.getItem).toHaveBeenCalledTimes(3);
    expect(encryptPassword.decrypt).toHaveBeenCalledWith(mockProjectId, mockEncryptedPassword);
    expect(generateKeypairFromSeedPhrase).toHaveBeenCalled();
    expect(web3.sendAndConfirmTransaction).toHaveBeenCalled();
  });

  it('should throw an error if wallet information is missing', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

    await expect(
      executeSwap(
        mockConnection,
        mockPublicKey,
        mockProgramId,
        mockFromTokenAddress,
        mockToTokenAddress,
        mockAmount
      )
    ).rejects.toThrow('Wallet information not found in localStorage');
  });

  it('should throw an error if project ID is missing', async () => {
    delete process.env.NEXT_PUBLIC_PROJECT_KEY;

    await expect(
      executeSwap(
        mockConnection,
        mockPublicKey,
        mockProgramId,
        mockFromTokenAddress,
        mockToTokenAddress,
        mockAmount
      )
    ).rejects.toThrow('There was an error getting the project ID');
  });

  // Add more test cases as needed...
});