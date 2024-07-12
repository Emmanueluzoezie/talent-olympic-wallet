import { walletInterface } from "@/app/lib/WalletInterface";
import { Transaction } from "@solana/web3.js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { action, params } = await request.json()
  
    switch (action) {
      case 'setNetwork':
        walletInterface.setNetwork(params.network)
        return NextResponse.json({ message: 'Network set successfully' })
      case 'setPublicKey':
        walletInterface.setPublicKey(params.publicKey)
        return NextResponse.json({ message: 'Public key set successfully' })
      case 'getBalance':
        try {
          const balance = await walletInterface.getBalance()
          return NextResponse.json({ balance })
        } catch (error) {
          return NextResponse.json({ error: (error as Error).message }, { status: 400 })
        }
      case 'sendTransaction':
        try {
          const transaction = Transaction.from(params.transaction)
          const signature = await walletInterface.sendTransaction(transaction)
          return NextResponse.json({ signature })
        } catch (error) {
          return NextResponse.json({ error: (error as Error).message }, { status: 400 })
        }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  }