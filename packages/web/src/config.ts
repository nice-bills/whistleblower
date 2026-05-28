export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS ?? "") as `0x${string}`;
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? "31337");

export const contractConfigured = CONTRACT_ADDRESS.length === 42 && CONTRACT_ADDRESS.startsWith("0x");
