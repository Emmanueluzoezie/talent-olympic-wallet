jest.mock('@solana/web3.js', () => ({
    Connection: jest.fn().mockImplementation(() => ({
      getParsedTokenAccountsByOwner: jest.fn(),
      getRecentBlockhash: jest.fn().mockResolvedValue({ blockhash: 'mockBlockhash' })
    })),
    PublicKey: jest.fn().mockImplementation((key) => ({
      toBase58: jest.fn().mockReturnValue(key),
      toString: jest.fn().mockReturnValue(key),
      toBuffer: jest.fn().mockReturnValue(Buffer.from(key)),
      equals: jest.fn().mockReturnValue(true)
    })),
    Transaction: jest.fn().mockImplementation(() => ({})),
    Keypair: {
      generate: jest.fn().mockReturnValue({
        publicKey: {
          toBase58: jest.fn().mockReturnValue('mockPublicKey'),
          toString: jest.fn().mockReturnValue('mockPublicKey'),
          toBuffer: jest.fn().mockReturnValue(Buffer.from('mockPublicKey')),
          equals: jest.fn().mockReturnValue(true)
        },
        secretKey: new Uint8Array(32)
      })
    },
    sendAndConfirmTransaction: jest.fn().mockResolvedValue('mockSignature')
  }));
  
  // Mock the @solana/spl-token module
  jest.mock('@solana/spl-token', () => ({
    getAssociatedTokenAddress: jest.fn().mockResolvedValue('mockAssociatedTokenAddress'),
    getAccount: jest.fn().mockResolvedValue({ amount: '1000000' }),
    getMint: jest.fn().mockResolvedValue({ decimals: 6 })
  }));
  
  import { Connection, PublicKey, Transaction, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
  import * as Token from "@solana/spl-token";
  import { walletInterface } from "../lib/WalletInterface";
  
  describe('WalletInterface', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('getInstance returns a singleton instance', () => {
      const instance1 = walletInterface;
      const instance2 = walletInterface;
      expect(instance1).toBe(instance2);
    });
  
    test('setRpcEndpoint updates the connection', () => {
      const newEndpoint = 'https://new-endpoint.com';
      walletInterface.setRpcEndpoint(newEndpoint);
      expect(Connection).toHaveBeenCalledWith(newEndpoint);
    });
  
    test('setNetwork updates the network and connection', () => {
      walletInterface.setNetwork('mainnet-beta');
      expect(Connection).toHaveBeenCalledWith('https://api.mainnet-beta.solana.com');
    });
  
    test('setPublicKey sets the public key', () => {
      const publicKeyString = 'SomePublicKeyString';
      walletInterface.setPublicKey(publicKeyString);
      expect(PublicKey).toHaveBeenCalledWith(publicKeyString);
    });
  
    test('getTokenBalance returns correct balance', async () => {
      walletInterface.setPublicKey('SomePublicKeyString');
  
      const mockMintAddress = 'SomeMintAddress';
      const balance = await walletInterface.getTokenBalance(mockMintAddress);
  
      expect(balance).toEqual({
        mint: mockMintAddress,
        accountIndex: 0,
        uiTokenAmount: {
          amount: '1000000',
          uiAmount: 1,
          uiAmountString: '1',
          decimals: 6
        }
      });
    });
  
    test('getAllTokenBalances returns correct balances', async () => {
      walletInterface.setPublicKey('SomePublicKeyString');
  
      const mockTokenAccounts = {
        value: [
          {
            account: {
              data: {
                parsed: {
                  info: {
                    mint: 'Mint1',
                    tokenAmount: {
                      amount: '1000000',
                      uiAmount: 1,
                      uiAmountString: '1',
                      decimals: 6
                    }
                  }
                }
              }
            }
          },
          {
            account: {
              data: {
                parsed: {
                  info: {
                    mint: 'Mint2',
                    tokenAmount: {
                      amount: '2000000',
                      uiAmount: 2,
                      uiAmountString: '2',
                      decimals: 6
                    }
                  }
                }
              }
            }
          }
        ]
      };
  
      (walletInterface.getConnection().getParsedTokenAccountsByOwner as jest.Mock).mockResolvedValue(mockTokenAccounts);
  
      const balances = await walletInterface.getAllTokenBalances();
  
      expect(balances).toEqual([
        {
          mint: 'Mint1',
          accountIndex: 0,
          uiTokenAmount: {
            amount: '1000000',
            uiAmount: 1,
            uiAmountString: '1',
            decimals: 6
          }
        },
        {
          mint: 'Mint2',
          accountIndex: 1,
          uiTokenAmount: {
            amount: '2000000',
            uiAmount: 2,
            uiAmountString: '2',
            decimals: 6
          }
        }
      ]);
    });
  
    test('sendTransaction sends transaction successfully', async () => {
      walletInterface.setPublicKey('SomePublicKeyString');
      walletInterface.setSigner(Keypair.generate());
  
      const mockTransaction = new Transaction();
      const signature = await walletInterface.sendTransaction(mockTransaction);
  
      expect(sendAndConfirmTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        mockTransaction,
        [expect.any(Object)]
      );
      expect(signature).toBe('mockSignature');
    });
  
    test('disconnect clears publicKey and signer', () => {
      walletInterface.setPublicKey('SomePublicKeyString');
      walletInterface.setSigner(Keypair.generate());
      walletInterface.disconnect();
      expect(walletInterface.isConnected()).toBe(false);
    });
  
    test('isConnected returns correct connection status', () => {
      expect(walletInterface.isConnected()).toBe(false);
      walletInterface.setPublicKey('SomePublicKeyString');
      walletInterface.setSigner(Keypair.generate());
      expect(walletInterface.isConnected()).toBe(true);
    });
  });