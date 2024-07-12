export interface Token {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
}

export interface SwapResult {
    transactionSignature: string;
    fromAmount: number;
    toAmount: number;
}