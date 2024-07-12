import { TOKENS } from "./TokenRegistry"
import { walletInterface } from "./WalletInterface"

async function performSwap(formData: FormData) {
    'use server'
    const fromToken = TOKENS.find(token => token.symbol === formData.get('fromToken'))
    const toToken = TOKENS.find(token => token.symbol === formData.get('toToken'))
    const amount = parseFloat(formData.get('amount') as string)
    const rate = parseFloat(formData.get('rate') as string)
  
    if (!fromToken || !toToken || isNaN(amount) || isNaN(rate)) {
      throw new Error('Invalid swap parameters')
    }

    // perform the swap
  }