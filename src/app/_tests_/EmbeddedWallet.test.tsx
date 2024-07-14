// EmbeddedWallet.test.tsx

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmbeddedWallet from '../components/EmbeddedWallet';
import { walletInterface } from '../lib/WalletInterface';
import { Keypair } from '@solana/web3.js';

// Mock the dependencies
jest.mock('../lib/WalletInterface', () => ({
  walletInterface: {
    setRpcEndpoint: jest.fn(),
    setPublicKey: jest.fn(),
    setSigner: jest.fn(),
  },
}));

jest.mock('../components/WalletSetup', () => {
  return {
    __esModule: true,
    default: ({ onKeySet }: { onKeySet: (keypair: Keypair) => void }) => {
      return {
        type: 'div',
        props: {
          'data-testid': 'wallet-setup',
          children: {
            type: 'button',
            props: {
              onClick: () => onKeySet(Keypair.generate()),
              children: 'Set Key',
            },
          },
        },
      };
    },
  };
});

jest.mock('../components/WalletScreen', () => ({
  __esModule: true,
  default: () => ({ type: 'div', props: { 'data-testid': 'wallet-screen', children: 'Wallet Screen' } }),
}));

jest.mock('../components/SwapInterface', () => ({
  __esModule: true,
  default: () => ({ type: 'div', props: { 'data-testid': 'swap-interface', children: 'Swap Interface' } }),
}));

jest.mock('../components/Setting', () => ({
  __esModule: true,
  default: () => ({ type: 'div', props: { 'data-testid': 'setting', children: 'Setting' } }),
}));

describe('EmbeddedWallet', () => {
  const mockProps = {
    rpcEndpoint: 'https://example.com/rpc',
    apiKey: 'test-api-key',
    projectKey: 'test-project-key',
  };

  it('renders WalletSetup initially', () => {
    render(<EmbeddedWallet {...mockProps} />);
    expect(screen.getByTestId('wallet-setup')).toBeInTheDocument();
  });

  it('sets RPC endpoint on mount', () => {
    render(<EmbeddedWallet {...mockProps} />);
    expect(walletInterface.setRpcEndpoint).toHaveBeenCalledWith(mockProps.rpcEndpoint, mockProps.apiKey);
  });

  it('switches to WalletScreen after key is set', async () => {
    render(<EmbeddedWallet {...mockProps} />);
    
    await act(async () => {
      fireEvent.click(screen.getByText('Set Key'));
    });

    expect(screen.getByTestId('wallet-screen')).toBeInTheDocument();
    expect(walletInterface.setPublicKey).toHaveBeenCalled();
    expect(walletInterface.setSigner).toHaveBeenCalled();
  });

  it('switches between components when buttons are clicked', async () => {
    render(<EmbeddedWallet {...mockProps} />);
    
    // Set key to move past setup
    await act(async () => {
      fireEvent.click(screen.getByText('Set Key'));
    });

    // Check if Wallet is visible initially
    expect(screen.getByTestId('wallet-screen')).toBeInTheDocument();

    // Switch to Swap
    fireEvent.click(screen.getByText('Swap'));
    expect(screen.getByTestId('swap-interface')).toBeInTheDocument();

    // Switch to Setting
    fireEvent.click(screen.getByText('Setting'));
    expect(screen.getByTestId('setting')).toBeInTheDocument();

    // Switch back to Wallet
    fireEvent.click(screen.getByText('Wallet'));
    expect(screen.getByTestId('wallet-screen')).toBeInTheDocument();
  });
});