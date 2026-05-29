# Confidential Wrapper Registry

Production-oriented explorer for the [official Zama Confidential Token Wrappers Registry](https://docs.zama.org/protocol/protocol-apps/confidential-tokens/wrapper-registry) — built for [Zama Developer Program Mainnet Season 3](https://www.zama.org/post/zama-developer-program-mainnet-season-3-composable-privacy-is-the-key) **Bounty Track**.

## What it does

| Requirement | Implementation |
|-------------|----------------|
| Surface ERC-20 ↔ ERC-7984 pairs (Sepolia + mainnet) | Paginated registry table via `@zama-fhe/react-sdk` `useListPairs` + on-chain pair count |
| Wrap / unwrap any valid pair | Per-pair page: `useShield` (wrap) and `useUnshield` / `useUnshieldAll` (unwrap) |
| Decrypt ERC-7984 balance (EIP-712) | `useAllow` + `useConfidentialBalance` user-decryption flow |
| Sepolia faucet for cTokenMocks | Mint official mock underlying ERC-20s (public `mint`, 10k units per click) |

The whistleblower Hardhat package remains in `packages/contracts` as an earlier Builder Track experiment; the active submission target is this registry web app.

## Monorepo

```
confidential-wrapper-registry/
├── packages/web/          # Vite + React + wagmi + @zama-fhe/react-sdk
├── packages/contracts/    # (legacy) FHEVM whistleblower contract
└── docs/                  # Architecture + bounty submission checklist
```

## Quick start

```bash
pnpm install
pnpm dev
```

Open the Vite URL (default `http://localhost:5173`). Connect a wallet on **Sepolia** or **Ethereum mainnet**.

Optional RPC overrides in `packages/web/.env`:

```bash
VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_MAINNET_RPC_URL=https://ethereum-rpc.publicnode.com
```

## Deployed registry addresses

| Network | Registry |
|---------|----------|
| Sepolia | `0x2f0750Bbb0A246059d80e94c454586a7F27a128e` |
| Mainnet | `0xeb5015fF021DB115aCe010f23F55C2591059bBA0` |

## Docs

- [`docs/SUBMISSION.md`](docs/SUBMISSION.md) — Bounty Track checklist (deadline **2026-07-07**)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — technical overview

## License

MIT
