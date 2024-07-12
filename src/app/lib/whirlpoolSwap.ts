import { PublicKey, TransactionInstruction, Connection, Keypair, Transaction, sendAndConfirmTransaction as webSendAndConfirmTransaction } from '@solana/web3.js';
import { Program, AnchorProvider, web3, Wallet, BN } from '@project-serum/anchor';
import WhirlpoolIDL from '../idl/whirlpool_idl';

class NodeWallet implements Wallet {
    constructor(readonly payer: Keypair) {
        this.payer = payer;
    }

    async signTransaction(tx: Transaction): Promise<Transaction> {
        tx.partialSign(this.payer);
        return tx;
    }

    async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
        return txs.map((tx) => {
            tx.partialSign(this.payer);
            return tx;
        });
    }

    get publicKey(): PublicKey {
        return this.payer.publicKey;
    }
}

export async function createSwapInstruction(
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
    const ix = await program.methods.swap(
        new BN(args.amount),
        new BN(args.otherAmountThreshold),
        new BN(args.sqrtPriceLimit),
        args.amountSpecifiedIsInput,
        args.aToB
    )
        .accounts(accounts)
        .instruction();

    return ix;
}

export async function executeSwap(
    connection: Connection,
    keypair: Keypair,
    programId: PublicKey,
    accounts: {
        tokenProgram: PublicKey;
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
) {
    const wallet = new NodeWallet(keypair);
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    const program = new Program(WhirlpoolIDL, programId, provider);

    const swapIx = await createSwapInstruction(program,
        { ...accounts, tokenAuthority: wallet.publicKey },
        args
    );

    const transaction = new web3.Transaction().add(swapIx);

    transaction.feePayer = keypair.publicKey;
    const signedTransaction = await wallet.signTransaction(transaction);

    const signature = await webSendAndConfirmTransaction(
        connection,
        signedTransaction,
        [keypair],
        { commitment: 'confirmed' }
    );

    console.log("Swap transaction signature", signature);
    return signature;
}