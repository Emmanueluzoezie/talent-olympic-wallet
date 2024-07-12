import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Signer } from "@solana/web3.js";

class WalletInterface {
    private connection: Connection;
    private publicKey: PublicKey | null = null;
    private network: string = 'devnet';
    private rpcEndpoint: string;
    private signer: Signer | null = null;

    constructor(rpcEndpoint?: string, apiKey?: string) {
        this.rpcEndpoint = rpcEndpoint || 'https://api.devnet.solana.com';
        if (apiKey) {
            this.rpcEndpoint += `?api-key=${apiKey}`;
        }
        this.connection = new Connection(this.rpcEndpoint);
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

    async getBalance(): Promise<number> {
        if (!this.publicKey) throw new Error('Public key is not set');
        const balance = await this.connection.getBalance(this.publicKey);
        return balance / 1000000000;
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

    // async sendSwapTransaction(fromToken: Token, toToken: Token, amount: number, rate: number): Promise<string> {
    //     if (!this.publicKey) throw new Error('Public key is not set');
    //     if (!this.signer) throw new Error('Signer is not set');
    //     return
    // }
}

export const walletInterface = new WalletInterface();