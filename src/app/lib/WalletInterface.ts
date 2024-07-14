import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Signer, Keypair, TokenBalance } from "@solana/web3.js";
import * as Token from "@solana/spl-token";
import { TokenAccountInfo } from "../types/Token";
import EventEmitter from 'eventemitter3';

class WalletInterface {
    private static instance: WalletInterface;
    private connection: Connection | null = null;
    private publicKey: PublicKey | null = null;
    private network: string = 'devnet';
    private rpcEndpoint: string = 'https://api.devnet.solana.com';
    private signer: Signer | null = null;
    private balances: { [key: string]: number } = {};
    private eventEmitter: EventEmitter;

    private constructor() {
        this.eventEmitter = new EventEmitter();
    }

    public static getInstance(): WalletInterface {
        if (!WalletInterface.instance) {
            WalletInterface.instance = new WalletInterface();
        }
        return WalletInterface.instance;
    }

    on(event: string, listener: (...args: any[]) => void) {
        this.eventEmitter.on(event, listener);
    }

    off(event: string, listener: (...args: any[]) => void) {
        this.eventEmitter.off(event, listener);
    }

    emit(event: string, ...args: any[]) {
        this.eventEmitter.emit(event, ...args);
    }

    setRpcEndpoint(rpcEndpoint: string) {
        this.rpcEndpoint = rpcEndpoint;
        this.connection = new Connection(this.rpcEndpoint, 'confirmed');
        this.emit('rpcEndpointChange', rpcEndpoint);
    }

    async setNetwork(network: string) {
        this.network = network;
        if (this.publicKey) {
            await this.updateBalances();
        }
        this.emit('networkChange', network);
    }

    setPublicKey(publicKeyString: string) {
        this.publicKey = new PublicKey(publicKeyString);
        this.emit('publicKeyChange', this.publicKey);
    }

    setSigner(signer: Signer) {
        this.signer = signer;
        this.emit('signerChange', signer);
    }

    getConnection(): Connection {
        if (!this.connection) {
            this.connection = new Connection(this.rpcEndpoint, 'confirmed');
        }
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
        if (!this.connection) throw new Error('Connection not initialized');

        const mint = new PublicKey(mintAddress);
        const associatedTokenAddress = await Token.getAssociatedTokenAddress(mint, this.publicKey);

        try {
            const accountInfo = await Token.getAccount(this.connection, associatedTokenAddress);
            const mintInfo = await Token.getMint(this.connection, mint);

            const balance = {
                mint: mintAddress,
                accountIndex: 0,
                uiTokenAmount: {
                    amount: accountInfo.amount.toString(),
                    uiAmount: Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals),
                    uiAmountString: (Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals)).toString(),
                    decimals: mintInfo.decimals
                }
            };

            this.emit('tokenBalanceChange', balance);
            return balance;
        } catch (error) {
            const zeroBalance = {
                mint: mintAddress,
                accountIndex: 0,
                uiTokenAmount: {
                    amount: "0",
                    uiAmount: 0,
                    uiAmountString: "0",
                    decimals: 0
                }
            };
            this.emit('tokenBalanceChange', zeroBalance);
            return zeroBalance;
        }
    }

    async getAllTokenBalances(maxRetries = 3): Promise<TokenBalance[]> {
        if (!this.publicKey) throw new Error('Public key is not set');
        if (!this.connection) throw new Error('Connection not initialized');

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(this.publicKey, {
                    programId: TOKEN_PROGRAM_ID
                });

                const balances = tokenAccounts.value.map((accountInfo, index) => {
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

                this.emit('allTokenBalancesChange', balances);
                return balances;
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
                if (attempt === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
        throw new Error('Failed to fetch token balances after multiple attempts');
    }

    async updateBalances() {
        if (!this.publicKey) return;
        if (!this.connection) throw new Error('Connection not initialized');

        const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(this.publicKey, {
            programId: TOKEN_PROGRAM_ID
        });

        this.balances = {};
        for (const accountInfo of tokenAccounts.value) {
            const parsedInfo = accountInfo.account.data.parsed.info as TokenAccountInfo;
            const mintPublicKey = new PublicKey(parsedInfo.mint);
            try {
                const mintInfo = await Token.getMint(this.connection, mintPublicKey);
                this.balances[parsedInfo.mint] = parseFloat(parsedInfo.amount) / Math.pow(10, mintInfo.decimals);
            } catch (error) {
                console.error(`Error fetching mint info for ${parsedInfo.mint}:`, error);
                this.balances[parsedInfo.mint] = parseFloat(parsedInfo.amount) / Math.pow(10, 9);
            }
        }

        this.emit('balancesUpdate', this.balances);
    }

    async sendTransaction(transaction: Transaction): Promise<string> {
        if (!this.publicKey) throw new Error('Public key is not set');
        if (!this.signer) throw new Error('Signer is not set');
        if (!this.connection) throw new Error('Connection not initialized');

        transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
        transaction.feePayer = this.publicKey;

        const signature = await sendAndConfirmTransaction(
            this.connection,
            transaction,
            [this.signer]
        );

        this.emit('transactionSent', signature);
        return signature;
    }

    async connect(publicKey: string, signer: Signer) {
        this.setPublicKey(publicKey);
        this.setSigner(signer);
        await this.updateBalances();
        this.emit('connect', this.publicKey);
    }

    disconnect() {
        this.publicKey = null;
        this.signer = null;
        this.connection = null;
        this.balances = {};
        this.emit('disconnect');
    }

    isConnected(): boolean {
        return this.publicKey !== null && this.signer !== null && this.connection !== null;
    }
}

export const walletInterface = WalletInterface.getInstance();