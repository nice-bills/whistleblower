# Confidential Whistleblower

Anonymous whistleblowing with **selective disclosure** on [Zama FHEVM](https://docs.zama.ai/protocol) — built for the [Zama Developer Program Mainnet Season 3](https://www.zama.org/post/zama-developer-program-mainnet-season-3-composable-privacy-is-the-key) **Builder Track**.

## Concept (vs Logos Whistleblower)

| | [Logos LP-0017 Whistleblower](https://github.com/logos-co/lambda-prize/blob/master/prizes/LP-0017.md) | This project |
|---|--------|----------------|
| Goal | Censorship-resistant **public** document publication | **Source-protected** submissions |
| Document | Public CID + metadata broadcast | **Public CID**, sensitive metadata **encrypted on-chain** |
| Identity | No on-chain identity binding (by design) | Submitter context encrypted (`eaddress`, extensible fields) |
| Disclosure | Permanent public index | **Authorized investigators** decrypt via FHEVM user-decryption |

FHE is not applied to “hide the document” — the leak is the document. FHE protects **who submitted** and **encrypted metadata** until an authorized party decrypts.

## Monorepo

```
confidential-whistleblower/
├── packages/contracts/   # FHEVM Hardhat — ConfidentialWhistleblower.sol
├── packages/web/         # Vite + React — submit + investigator UI (stubs)
└── docs/                 # Architecture, cloud handoff, submission checklist
```

## Quick start

```bash
# From repo root
pnpm install

# Contracts (mock FHE, fast)
pnpm compile
pnpm test

# Frontend
pnpm dev
```

### Sepolia deploy (when ready)

```bash
cd packages/contracts
pnpm exec hardhat vars set MNEMONIC
pnpm exec hardhat vars set INFURA_API_KEY
pnpm deploy:sepolia
```

Copy deployed address to `packages/web/.env` as `VITE_CONTRACT_ADDRESS`.

## Docs for cloud agent

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — data model, trust boundaries, FHE flows
- [`docs/CLOUD_AGENT.md`](docs/CLOUD_AGENT.md) — prioritized backlog and handoff notes
- [`docs/SUBMISSION.md`](docs/SUBMISSION.md) — Season 3 Builder Track checklist (deadline **2026-07-07**)

## License

MIT
