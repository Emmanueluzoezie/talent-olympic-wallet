# Embedded Solana Wallet

Video - https://www.loom.com/share/45237bdc66524f5fb6baeec9b34b70a6

## Overview

This project is an embeddable Solana wallet that can be easily integrated into web applications. It provides a user-friendly interface for managing Solana tokens, performing swaps, and interacting with the Solana blockchain. The wallet supports both standalone and embedded modes, making it versatile for various use cases.

## Features

- **Wallet Creation**: Users can generate a new wallet or import an existing one using a seed phrase.
- **Secure Storage**: Encrypts and stores the user's seed phrase locally, ensuring security.
- **Token Management**: View balances of SOL and SPL tokens.
- **Token Swaps**: Integrated swap functionality for exchanging tokens.
- **Network Switching**: Support for both Mainnet and Devnet, with easy network switching.
- **Responsive Design**: Works seamlessly on both desktop and mobile devices.
- **Customizable Theming**: Easily adaptable to match your application's design.

## Installation

import { EmbeddedWallet } from '@your-org/embedded-solana-wallet';

 <EmbeddedWallet 
        mode="embedded"
        mainnetRpcEndpoint="https://api.mainnet-beta.solana.com"
        devnetRpcEndpoint="https://api.devnet.solana.com"
        projectKey="your-project-key"
      />

 <EmbeddedWallet 
        mode="standalone"
        mainnetRpcEndpoint="your mainnet rpc"
        devnetRpcEndpoint="hyour devnet rpc"
        projectKey="your-project-key"
      />

Props

mode: 'standalone' | 'embedded' - Determines how the wallet is displayed.
mainnetRpcEndpoint: String - RPC endpoint for Solana mainnet.
devnetRpcEndpoint: String - RPC endpoint for Solana devnet.
projectKey: String - Your project's unique key for encryption purposes.

Components
EmbeddedWallet
The main component that orchestrates the wallet functionality.
WalletSetup
Handles the initial wallet setup, including creation and import processes.
WalletScreen
Displays the main wallet interface, showing balances and transaction options.
SwapInterface
Provides the interface for token swaps.
Setting
Allows users to change settings like the network (mainnet/devnet).
Security

Passwords and seed phrases are encrypted before storage.
Decryption occurs client-side to ensure sensitive data never leaves the user's device.
Implements a lockout mechanism to prevent brute-force attacks.

Customization
The wallet's appearance can be customized using the ThemeProvider. Modify colors, fonts, and other styles to match your application's design.
