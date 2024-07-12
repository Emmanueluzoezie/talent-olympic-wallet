import { Keypair } from "@solana/web3.js";

export interface WalletInfo {
    publicKey: string;
    balance: number;
    network: string;
}

export interface WalletAPIProps {
    rpcEndpoint?: string;
    apiKey?: string;
}

export interface WalletSetupProps {
    onKeySet: (keypair: Keypair) => void;
    projectKey: string;
}