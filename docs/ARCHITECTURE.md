# Architecture

## Problem

Logos **Whistleblower** ([LP-0017](https://github.com/logos-co/lambda-prize/blob/master/prizes/LP-0017.md)) optimizes for **censorship-resistant public publication**: upload → broadcast CID → optional on-chain anchor. Identity is intentionally not bound on-chain.

Real whistleblowing also needs **source protection**: the document may need to be public (or shareable with journalists) while **submitter identity and context** stay confidential until a trusted party is allowed to see them.

## Solution

```
┌─────────────┐     encrypt metadata      ┌──────────────────────────────┐
│  Submitter  │ ────────────────────────► │ ConfidentialWhistleblower    │
│  (browser)  │     + public documentCid  │ (FHEVM on Sepolia / mainnet) │
└─────────────┘                           └──────────────┬───────────────┘
        │                                                │
        │ IPFS / Filecoin / web3.storage                 │ eaddress, euint*
        ▼                                                ▼
┌─────────────┐                           ┌──────────────────────────────┐
│  Public     │                           │  Coprocessor + KMS           │
│  document   │                           │  (Zama Protocol)             │
│  bytes      │                           └──────────────┬───────────────┘
└─────────────┘                                          │
                                                           │ user-decrypt (EIP-712)
┌─────────────┐                                            ▼
│ Investigator│ ◄──────────────────────────────────────────┘
│ (allowlisted)│
└─────────────┘
```

### Public on-chain

- `documentCid` — content address (IPFS CID string)
- `submittedAt`, `submissionId`
- Events for indexing

### Encrypted on-chain (FHE handles)

- `encryptedReporter` (`eaddress`) — submitter wallet or pseudonym link (client-encrypted)
- `encryptedRiskTier` (`euint32`) — example scalar metadata (severity 1–5); extend as needed

Long text (title, description, internal notes) should use one of:

1. **Encrypted off-chain blob** referenced by CID in public `documentCid` or a secondary `metadataCid` field (recommended for v1 demo)
2. **Multiple encrypted scalars** on-chain if you need homomorphic logic on those fields
3. Future: chunked `euint*` arrays if the protocol pattern is justified

### Access control

- Contract owner adds `investigators` mapping
- `shareSubmissionWithInvestigator(submissionId, investigator)` calls `FHE.allow` on encrypted fields for that investigator
- Investigator uses Relayer SDK **user decryption** (EIP-712) in the frontend

Submitter receives `FHE.allow(encryptedReporter, msg.sender)` on submit so they can verify their own ciphertext.

## Trust model

| Actor | Trust |
|-------|--------|
| Submitter | Honest encryption client; can choose not to link real identity in `encryptedReporter` |
| Zama KMS / coprocessors | Protocol trust assumption (threshold MPC) |
| Owner / investigator list | Centralized gate for who may decrypt — acceptable for “newsroom / ombuds” model |
| Public | Sees CIDs and submission count, not encrypted fields |

This is **not** a mixnet: timing and gas payer can leak hints. Document in README / video for judges.

## Contract API (v0 scaffold)

See `packages/contracts/contracts/ConfidentialWhistleblower.sol`.

| Function | Purpose |
|----------|---------|
| `submit(documentCid, encryptedReporter, encryptedRiskTier, proof)` | Create submission |
| `grantInvestigator` / `revokeInvestigator` | ACL admin |
| `shareSubmissionWithInvestigator` | `FHE.allow` for a given submission |
| `getSubmission` | Public + encrypted handles for UI |

## Frontend flows (planned)

1. **Submit** — upload file → IPFS → encrypt reporter + risk tier → `submit` tx
2. **Browse** — list public CIDs from events / subgraph (optional)
3. **Investigate** — connect as investigator → `userDecrypt` on allowed handles

## Networks

- Local: Hardhat mock FHE (`npm test`)
- Target: **Sepolia** (dev), **Ethereum mainnet** (Season 3 submission allowed)

## Out of scope (v0)

- Logos Storage / Delivery integration (different stack)
- Permissionless batch anchoring
- On-chain full-text search
- Decentralized investigator governance
