jest.mock("@solana/web3.js", () => ({
    Keypair: {
      fromSeed: jest.fn(),
    },
  }));
  
  jest.mock("bip39", () => ({
    mnemonicToSeed: jest.fn(),
  }));
  
  jest.mock("ed25519-hd-key", () => ({
    derivePath: jest.fn(),
  }));
  
  import { Keypair } from "@solana/web3.js";
  import * as bip39 from "bip39";
  import { derivePath } from "ed25519-hd-key";
  import generateKeypairFromSeedPhrase from "../utils/getKeypair";
  
  describe('generateKeypairFromSeedPhrase', () => {
    const mockSeedPhrase = "test seed phrase";
    const mockSeed = Buffer.from("mockseed");
    const mockDerivedKey = Buffer.from("mockderivedkey");
    const mockKeypair = {
      publicKey: { toBase58: () => "mockpublickey" },
      secretKey: Buffer.from("mocksecretkey"),
    };
  
    beforeEach(() => {
      jest.resetAllMocks();
  
      (bip39.mnemonicToSeed as jest.Mock).mockResolvedValue(mockSeed);
      (derivePath as jest.Mock).mockReturnValue({ key: mockDerivedKey });
      (Keypair.fromSeed as jest.Mock).mockReturnValue(mockKeypair);
    });
  
    it('should generate a keypair from a seed phrase', async () => {
      const result = await generateKeypairFromSeedPhrase(mockSeedPhrase);
  
      expect(bip39.mnemonicToSeed).toHaveBeenCalledWith(mockSeedPhrase);
      expect(derivePath).toHaveBeenCalledWith("m/44'/501'/0'/0'", mockSeed.toString('hex'));
      expect(Keypair.fromSeed).toHaveBeenCalledWith(mockDerivedKey);
  
      expect(result).toBe(mockKeypair);
    });
  
    it('should throw an error if the seed phrase is invalid', async () => {
      (bip39.mnemonicToSeed as jest.Mock).mockRejectedValue(new Error('Invalid mnemonic'));
  
      await expect(generateKeypairFromSeedPhrase("invalid seed phrase")).rejects.toThrow('Invalid mnemonic');
    });
  
    it('should throw an error if derivePath fails', async () => {
      (derivePath as jest.Mock).mockImplementation(() => {
        throw new Error('Derivation failed');
      });
  
      await expect(generateKeypairFromSeedPhrase(mockSeedPhrase)).rejects.toThrow('Derivation failed');
    });
  
    it('should throw an error if Keypair.fromSeed fails', async () => {
      (Keypair.fromSeed as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid seed');
      });
  
      await expect(generateKeypairFromSeedPhrase(mockSeedPhrase)).rejects.toThrow('Invalid seed');
    });
  });