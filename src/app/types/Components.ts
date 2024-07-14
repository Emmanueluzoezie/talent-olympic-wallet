import { SelectTokenType, SwapResult, Token } from './Token';
import { Keypair } from '@solana/web3.js';
import { IconType } from 'react-icons';

export interface EmbeddedWalletProps {
    rpcEndpoint?: string;
    apiKey?: string;
    projectKey: string;

}

export interface WalletInfoProps {
    onBalanceChange?: (balance: number) => void;
    onNetworkChange?: (network: string) => void;
}

export interface SwapInterfaceProps {
    onSwapComplete?: (result: SwapResult) => void;
    availableTokens?: Token[];
}

export interface PasswordFormProps {
    onPasswordSet: (password: string) => void;
    password: string;
    setPassword: (password: string) => void;
    projectKey: string;
}

export interface WalletCreationProps {
    projectKey: string;
    onKeySet: (keypair: Keypair) => void;
}

export interface ButtonsProps {
    activeComponent: string
    Icon: IconType;
    title: string;
    setActiveComponent: (component: "wallet" | "swap" | "setting") => void;
}

export interface WalletScreenProps {
    activeComponent: string
    setActiveComponent: (component: "wallet" | "swap" | "setting" | "add") => void;
}

export interface CurrencyInputProps {
    selectedCurrency: SelectTokenType;
    onCurrencyClick: () => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    amount: string;
    onMaxClick?: () => void;
    inSufficient?: boolean
    disabled?: boolean;
}

export interface CurrencyDropdownProps {
    onSelect: (token: SelectTokenType) => void;
    tokens: Token[];
}


export interface TokenDetailsProps {
    symbol: string;
}

export interface GetStartedProps {
    onGetStarted: () => void;
}

export interface SeedPhraseInputProps {
    seedPhrase: string;
    onChange: (phrase: string) => void;
    disable?: boolean
}