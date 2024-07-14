import { PublicKey, TransactionInstruction, Connection, Transaction, sendAndConfirmTransaction, VersionedTransaction, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, web3, Wallet, BN } from '@project-serum/anchor';
import WhirlpoolIDL from '../idl/whirlpool_idl';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ORCA_WHIRLPOOL_PROGRAM_ID, PDAUtil, TickArrayUtil, WhirlpoolContext, buildWhirlpoolClient } from '@orca-so/whirlpools-sdk';
import { encryptPassword } from './PasswordEncryption';
import { decryptSecretKey } from './Encryption';
import * as bip39 from 'bip39';
import { ed25519 } from '@noble/curves/ed25519';
import generateKeypairFromSeedPhrase from './getKeypair';

class NodeWallet implements Wallet {
    constructor(readonly payer: web3.Keypair) { }

    async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
        if (tx instanceof Transaction) {
            tx.partialSign(this.payer);
        } else {
            tx.sign([this.payer]);
        }
        return tx;
    }

    async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
        return txs.map((tx) => {
            if (tx instanceof Transaction) {
                tx.partialSign(this.payer);
            } else {
                tx.sign([this.payer]);
            }
            return tx;
        });
    }

    get publicKey(): PublicKey {
        return this.payer.publicKey;
    }
}

async function createSwapInstruction(
    program: Program,
    accounts: {
        tokenProgram: PublicKey;
        tokenAuthority: PublicKey;
        whirlpool: PublicKey;
        tokenOwnerAccountA: PublicKey;
        tokenVaultA: PublicKey;
        tokenOwnerAccountB: PublicKey;
        tokenVaultB: PublicKey;
        tickArray0: PublicKey;
        tickArray1: PublicKey;
        tickArray2: PublicKey;
        oracle: PublicKey;
    },
    args: {
        amount: number;
        otherAmountThreshold: number;
        sqrtPriceLimit: number;
        amountSpecifiedIsInput: boolean;
        aToB: boolean;
    }
): Promise<TransactionInstruction> {
    return program.methods.swap(
        new BN(args.amount),
        new BN(args.otherAmountThreshold),
        new BN(args.sqrtPriceLimit),
        args.amountSpecifiedIsInput,
        args.aToB
    )
        .accounts(accounts)
        .instruction();
}

export async function executeSwap(
    connection: Connection,
    publicKey: PublicKey,
    programId: PublicKey,
    fromTokenAddress: PublicKey,
    toTokenAddress: PublicKey,
    amount: string
) {
    try {
        const amountNumber = parseFloat(amount) * 1e6;

        const encryptedSeedPhrase = localStorage.getItem('encryptedSeedPhrase');
        const publicKeyString = localStorage.getItem('walletPublicKey');
        const encryptedPassword = localStorage.getItem('encryptedPassword');
        const projectId = process.env.NEXT_PUBLIC_PROJECT_KEY

        if (!encryptedSeedPhrase || !publicKeyString || !encryptedPassword) {
            throw new Error('Wallet information not found in localStorage');
        }
        if (!projectId) {
            throw new Error('There was an error getting the project ID');
        }

        const password = await encryptPassword.decrypt(projectId, encryptedPassword);

        const seedPhrase = await decryptSecretKey(encryptedSeedPhrase, password);

        const privateKey = await generateKeypairFromSeedPhrase(seedPhrase);

        if (!privateKey) {
            throw new Error('There was an error generating the private key');
        }
        const keypair = Keypair.fromSecretKey(Uint8Array.from(privateKey.secretKey));
        const wallet = new NodeWallet(keypair);
        const ctx = WhirlpoolContext.from(connection, wallet, ORCA_WHIRLPOOL_PROGRAM_ID);
        const client = buildWhirlpoolClient(ctx);

        const whirlpoolPda = PDAUtil.getWhirlpool(ORCA_WHIRLPOOL_PROGRAM_ID, programId, fromTokenAddress, toTokenAddress, 64);
        const whirlpoolPubKey = whirlpoolPda.publicKey;

        const whirlpoolData = await client.getPool(whirlpoolPubKey);

        const aToB = fromTokenAddress.equals(whirlpoolData.getTokenAInfo().mint);

        const tickArrays = TickArrayUtil.getTickArrayPDAs(
            whirlpoolData.getData().tickCurrentIndex,
            whirlpoolData.getData().tickSpacing,
            3,
            programId,
            whirlpoolPubKey,
            aToB
        );

        const accounts = {
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenAuthority: keypair.publicKey,
            whirlpool: whirlpoolPubKey,
            tokenOwnerAccountA: fromTokenAddress,
            tokenVaultA: whirlpoolData.getData().tokenVaultA,
            tokenOwnerAccountB: toTokenAddress,
            tokenVaultB: whirlpoolData.getData().tokenVaultB,
            tickArray0: tickArrays[0].publicKey,
            tickArray1: tickArrays[1].publicKey,
            tickArray2: tickArrays[2].publicKey,
            oracle: whirlpoolData.getAddress()
        };

        const args = {
            amount: amountNumber,
            otherAmountThreshold: 0,
            sqrtPriceLimit: 0,
            amountSpecifiedIsInput: true,
            aToB: fromTokenAddress.equals(whirlpoolData.getData().tokenMintA)
        };

        const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
        const program = new Program(WhirlpoolIDL, programId, provider);

        const swapIx = await createSwapInstruction(program, accounts, args);

        const transaction = new Transaction().add(swapIx);
        transaction.feePayer = keypair.publicKey;

        const signedTransaction = await wallet.signTransaction(transaction);

        const signature = await sendAndConfirmTransaction(
            connection,
            signedTransaction,
            [wallet.payer],
            { commitment: 'confirmed' }
        );
        return signature;
    } catch (error) {
        console.error('Swap execution failed:', error);
        if (error instanceof Error) {
            throw new Error(`Swap failed: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred during the swap');
        }
    }
}