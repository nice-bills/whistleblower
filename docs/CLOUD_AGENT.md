# Cloud agent handoff

Use this file as the single backlog for continuing development. Repo is scaffold-only: compiles, one passing mock test, UI stubs.

## Context

- **Program**: Zama Developer Program Mainnet Season 3 — **Builder Track**
- **Deadline**: 2026-07-07 23:59 AOE
- **Deliverables**: confidential dApp (contracts + frontend), README, **3-minute video**, deploy Sepolia or mainnet
- **Pitch**: Anonymous whistleblower — public document CID, encrypted source metadata, investigator selective decryption

## Done in scaffold

- [x] Monorepo (`packages/contracts`, `packages/web`)
- [x] `ConfidentialWhistleblower.sol` with submit, investigator ACL, `FHE.allow` sharing
- [x] Hardhat + `@fhevm/hardhat-plugin` wired from official template versions
- [x] Deploy script + mock FHE test (submit + share + decrypt reporter address)
- [x] Vite/React UI stubs: Submit, Investigate pages
- [x] Architecture + submission checklist docs

## P0 — Must ship for Builder submission

1. **IPFS upload** (`packages/web`)
   - Integrate web3.storage or Pinata; store file; pass CID to `submit`
   - Show public CID link (ipfs.io gateway) on success

2. **Relayer SDK submit flow**
   - `createEncryptedInput(contract, user).addAddress(reporter).add32(riskTier).encrypt()`
   - Call `submit` with handles + `inputProof`
   - Handle Sepolia chain + deployed address from env

3. **Investigator decrypt flow**
   - Detect `investigators(wallet)` on connect
   - For each submission, call `userDecryptEaddress` / `userDecryptEuint` (see contract test)
   - Display plaintext metadata only for submissions where `shareSubmissionWithInvestigator` was called

4. **Sepolia deploy + verify**
   - `pnpm deploy:sepolia` in contracts package
   - Document address in root README
   - `fhevm check-fhevm-compatibility` on deployed address

5. **README polish**
   - Demo script, env setup, trust model, comparison to LP-0017

6. **3-minute video**
   - Submit as anonymous user → show public CID
   - Admin grants investigator + shares submission
   - Investigator decrypts metadata; third party cannot

## P1 — Stronger demo

- Event indexer or simple `submissionCount` loop in UI
- Optional encrypted **metadata JSON** on IPFS (AES) with only decryption key wrapped via FHE — if on-chain fields feel too small
- `grantInvestigator` UI for owner wallet
- Mainnet deploy (if budget allows)

## P2 — Nice to have

- Subgraph / Ponder indexer
- EIP-712 typed data preview in UI
- Multiple investigator roles (lead vs reviewer)
- Encrypted whistleblower “reply thread” per submission

## Key files

| Path | Role |
|------|------|
| `packages/contracts/contracts/ConfidentialWhistleblower.sol` | Core protocol |
| `packages/contracts/test/ConfidentialWhistleblower.ts` | Reference for encrypt/decrypt test patterns |
| `packages/contracts/deploy/deploy.ts` | Deployment |
| `packages/web/src/pages/Submit.tsx` | Submitter UX |
| `packages/web/src/pages/Investigate.tsx` | Investigator UX |
| `docs/SUBMISSION.md` | Judge-facing checklist |

## Commands

```bash
pnpm install
pnpm test
pnpm dev
```

## External references

- [FHEVM Hardhat template](https://github.com/zama-ai/fhevm-hardhat-template)
- [Protocol docs](https://docs.zama.ai/protocol)
- [Relayer SDK](https://github.com/zama-ai/sdk) — `@zama-fhe/relayer-sdk`, `@zama-fhe/react-sdk`
- [OpenZeppelin confidential integration guide](https://docs.zama.org/protocol/examples/openzeppelin-confidential-contracts/integration-guide)

## Product defaults chosen with user

These decisions should guide the MVP unless the user explicitly changes direction:

- Build selective source protection, not encrypted publication: the document CID is public while source metadata is encrypted on-chain.
- Use a single owner/admin wallet for v1 investigator access.
- Treat `encryptedReporter` as a pseudonymous or throwaway source address, not proof of full anonymity.
- Start with IPFS/public CID flow; use user-provided CID or simple pinning first if needed to move faster.
- Optimize the demo for: submit public CID → encrypted metadata stored → owner grants/shares to investigator → investigator decrypts → outsider fails.

## Deferred product questions

- When to add relayers/account abstraction to reduce `msg.sender` and funding-link leakage.
- Whether to expand from owner wallet to multisig or DAO governance.
- Whether to mirror documents on Arweave after the IPFS path works.
