import { TOKEN_PROGRAM_ID, } from "@project-serum/anchor/dist/cjs/utils/token";
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Signer, Keypair, TokenBalance } from "@solana/web3.js";
import * as Token from "@solana/spl-token";

class WalletInterface {
    private static instance: WalletInterface;
    private connection: Connection;
    private publicKey: PublicKey | null = null;
    private network: string = 'devnet';
    private rpcEndpoint: string;
    private signer: Signer | null = null;

    private constructor(rpcEndpoint?: string, apiKey?: string) {
        this.rpcEndpoint = rpcEndpoint || 'https://api.devnet.solana.com';
        if (apiKey) {
            this.rpcEndpoint += `?api-key=${apiKey}`;
        }
        this.connection = new Connection(this.rpcEndpoint);
    }

    public static getInstance(rpcEndpoint?: string, apiKey?: string): WalletInterface {
        if (!WalletInterface.instance) {
            WalletInterface.instance = new WalletInterface(rpcEndpoint, apiKey);
        }
        return WalletInterface.instance;
    }

    setRpcEndpoint(rpcEndpoint: string, apiKey?: string) {
        this.rpcEndpoint = rpcEndpoint;
        if (apiKey) {
            this.rpcEndpoint += `?api-key=${apiKey}`;
        }
        this.connection = new Connection(this.rpcEndpoint);
    }

    setNetwork(network: string) {
        this.network = network;
        this.rpcEndpoint = this.getNetworkUrl(network);
        this.connection = new Connection(this.rpcEndpoint);
    }

    private getNetworkUrl(network: string): string {
        switch (network) {
            case 'mainnet-beta':
                return 'https://api.mainnet-beta.solana.com';
            case 'testnet':
                return 'https://api.testnet.solana.com';
            case 'devnet':
            default:
                return 'https://api.devnet.solana.com';
        }
    }

    setPublicKey(publicKeyString: string) {
        this.publicKey = new PublicKey(publicKeyString);
    }

    setSigner(signer: Signer) {
        this.signer = signer;
    }

    getConnection(): Connection {
        return this.connection;
    }

    getPublicKey(): PublicKey | null {
        return this.publicKey;
    }

    getNetwork(): string {
        return this.network;
    }

    async getTokenBalance(mintAddress: string): Promise<TokenBalance> {
        if (!this.publicKey) throw new Error('Public key is not set');
        
        const mint = new PublicKey(mintAddress);
        const associatedTokenAddress = await Token.getAssociatedTokenAddress(mint, this.publicKey);
        
        try {
            const accountInfo = await Token.getAccount(this.connection, associatedTokenAddress);
            const mintInfo = await Token.getMint(this.connection, mint);
            
            return {
                mint: mintAddress,
                accountIndex: 0,
                uiTokenAmount: {
                    amount: accountInfo.amount.toString(),
                    uiAmount: Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals),
                    uiAmountString: (Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals)).toString(),
                    decimals: mintInfo.decimals
                }
            };
        } catch (error) {
            console.error("Error fetching token balance:", error);
            return {
                mint: mintAddress,
                accountIndex: 0,
                uiTokenAmount: {
                    amount: "0",
                    uiAmount: 0,
                    uiAmountString: "0",
                    decimals: 0
                }
            };
        }
    }

    async getAllTokenBalances(): Promise<TokenBalance[]> {
        if (!this.publicKey) throw new Error('Public key is not set');
        
        const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(this.publicKey, {
            programId: TOKEN_PROGRAM_ID
        });
    
        return tokenAccounts.value.map((accountInfo, index) => {
            const parsedInfo = accountInfo.account.data.parsed.info;
            return {
                mint: parsedInfo.mint,
                accountIndex: index,
                uiTokenAmount: {
                    amount: parsedInfo.tokenAmount.amount,
                    uiAmount: parsedInfo.tokenAmount.uiAmount,
                    uiAmountString: parsedInfo.tokenAmount.uiAmountString,
                    decimals: parsedInfo.tokenAmount.decimals
                }
            };
        });
    }

    async sendTransaction(transaction: Transaction): Promise<string> {
        if (!this.publicKey) throw new Error('Public key is not set');
        if (!this.signer) throw new Error('Signer is not set');

        transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
        transaction.feePayer = this.publicKey;

        const signature = await sendAndConfirmTransaction(
            this.connection,
            transaction,
            [this.signer]
        );
        return signature;
    }

    disconnect() {
        this.publicKey = null;
        this.signer = null;
    }

    isConnected(): boolean {
        return this.publicKey !== null && this.signer !== null;
    }
}

export const walletInterface = WalletInterface.getInstance();