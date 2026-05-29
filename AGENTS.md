# Agent notes

## Product focus (Season 3 Bounty Track)

Build the **Confidential Wrapper Registry** web app — not the whistleblower MVP. The bounty asks for:

- Full registry coverage on Sepolia + mainnet
- Wrap / unwrap for any valid pair
- EIP-712 user-decryption for ERC-7984 balances
- Sepolia faucet for official cTokenMocks

Use `@zama-fhe/react-sdk` 3.x (`useListPairs`, `useShield`, `useUnshield`, `useAllow`, `useConfidentialBalance`). Registry addresses are in `SepoliaConfig` / `MainnetConfig`.

## Cursor Cloud specific instructions

- `pnpm install` from repo root, then `pnpm dev` for the web app (port 5173).
- Wallet must be on Sepolia or Ethereum mainnet; injected connector only unless WalletConnect is added.
- Faucet mint only works on Sepolia mock underlyings (`packages/web/src/constants/sepolia-mocks.ts`).
- `packages/contracts` is legacy whistleblower; `pnpm test` still validates that package but is not the bounty deliverable.
