import { PublicKey } from "@solana/web3.js";

export interface Token {
    symbol: string;
    name: string;
    decimals: number;
    image?: string
    address: string;
    pythPriceId: string
    pythTokenId: string
}

export interface SwapResult {
    transactionSignature: string;
    fromAmount: number;
    toAmount: number;
}

export interface TokenBalance {
    mint: string;
    accountIndex: number;
    uiTokenAmount: {
        amount: string;
        uiAmount: number | null;
        uiAmountString: string;
        decimals: number;
    };
}

export interface TokenContextType {
    tokens: Token[];
    prices: { [key: string]: number };
    balances: { [key: string]: number };
    totalBalanceInUSDC: number;
    refreshTokenData: () => Promise<void>; 
}

export interface SelectTokenType {
    symbol: string;
    image?: string
}

export interface TokenAccountInfo {
    mint: string;
    owner: string;
    amount: string;
    delegate: string | null;
    delegatedAmount: number;
    isInitialized: boolean;
    isFrozen: boolean;
    isNative: boolean;
    rentExemptReserve: string | null;
    closeAuthority: string | null;
}