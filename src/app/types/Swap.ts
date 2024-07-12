import { Token } from "./Token";

export interface SwapParams {
    fromToken: Token;
    toToken: Token;
    amount: number;
    rate: number;
  }