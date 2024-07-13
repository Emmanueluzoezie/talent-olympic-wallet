import { Token } from "../types/Token";

export const TOKENS: Token[] = [
    {
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToIG8feZdv7SVG0RYdGFUy8FDf_wxddAruJQ&s",
        address: 'So11111111111111111111111111111111111111112',
        pythPriceId: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
        pythTokenId: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d'
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        image: "https://s3.coinmarketcap.com/static-gravity/image/5a8229787b5e4c809b5914eef709b59a.png",
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        pythPriceId: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
        pythTokenId: 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'
    },
    {
        symbol: 'PYTH',
        name: 'Pyth Network',
        decimals: 6,
        image: "https://pyth.network/token.svg",
        address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
        pythPriceId: '0x0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff',
        pythTokenId: '0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff'
    },
    {
        symbol: 'JUP',
        name: 'Jupiter',
        decimals: 5,
        image: "https://static.jup.ag/jup/icon.png",
        address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        pythPriceId: '0x0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996',
        pythTokenId: '0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996'
    },
    {
        symbol: 'BONK',
        name: 'Bonk',
        decimals: 5,
        image: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        pythPriceId: '0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419',
        pythTokenId: '72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419'
    },

];

export function getTokenImagePath(symbol: string): string {
    return `/images/tokens/${symbol.toLowerCase()}.png`;
}
