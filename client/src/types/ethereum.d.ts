interface EthereumProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  providers?: EthereumProvider[];
}

interface Window {
  ethereum?: EthereumProvider;
  coinbaseWalletExtension?: EthereumProvider;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    coinbaseWalletExtension?: EthereumProvider;
  }
}

export {};