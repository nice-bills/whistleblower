import { MainnetConfig, SepoliaConfig } from "@zama-fhe/react-sdk";

export const SEPOLIA_RPC = import.meta.env.VITE_SEPOLIA_RPC_URL ?? SepoliaConfig.network;
export const MAINNET_RPC = import.meta.env.VITE_MAINNET_RPC_URL ?? MainnetConfig.network;

export const REGISTRY_ADDRESSES = {
  1: MainnetConfig.registryAddress!,
  11155111: SepoliaConfig.registryAddress!,
} as const;

export const SUPPORTED_CHAIN_IDS = [1, 11155111] as const;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

export function isSupportedChainId(id: number): id is SupportedChainId {
  return id === 1 || id === 11155111;
}

function explorerBase(chainId: number): string {
  return chainId === 1 ? "https://etherscan.io" : "https://sepolia.etherscan.io";
}

export function explorerAddress(chainId: number, address: string): string {
  return `${explorerBase(chainId)}/address/${address}`;
}

export function explorerTx(chainId: number, hash: string): string {
  return `${explorerBase(chainId)}/tx/${hash}`;
}

export function chainLabel(chainId: number): string {
  return chainId === 1 ? "Ethereum mainnet" : "Sepolia testnet";
}
