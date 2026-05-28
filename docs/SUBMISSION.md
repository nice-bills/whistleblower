# Zama Developer Program — Builder Track checklist

**Season 3** · Deadline **2026-07-07 23:59 AOE**

## Project

**Confidential Whistleblower** — public document CID + FHE-encrypted source metadata + investigator selective decryption.

## Required deliverables

- [ ] Confidential smart contract deployed on **Sepolia** or **Ethereum mainnet**
- [ ] Frontend (functional submit + investigator decrypt)
- [ ] Clear documentation (root README + architecture)
- [ ] **3-minute video pitch** demoing end-to-end flow
- [ ] Submit via official Builder Track form (link on [Season 3 post](https://www.zama.org/post/zama-developer-program-mainnet-season-3-composable-privacy-is-the-key))
- [ ] Share on X tagging **@zama** with **#ZamaDeveloperProgram**

## Suggested demo script (video)

1. Intro: contrast with Logos public whistleblower — source protection problem (30s)
2. Submitter uploads document → public IPFS CID on-chain (45s)
3. Show block explorer: CID visible, encrypted handles opaque (30s)
4. Owner grants investigator + `shareSubmissionWithInvestigator` (30s)
5. Investigator wallet decrypts reporter + risk tier; unprivileged wallet cannot (45s)
6. Close: FHE enables composable privacy for accountability journalism (20s)

## Rewards (reference)

| Place | cUSDT |
|-------|-------|
| 1st | 2,500 |
| 2nd | 1,750 |
| 3rd | 1,250 |
| 4th | 1,000 |
| 5th | 500 |

## Technical verification before submit

```bash
pnpm test
cd packages/contracts && pnpm exec hardhat fhevm check-fhevm-compatibility --network sepolia --address <ADDR>
```

## Support

- developer@zama.org
- [Discord](https://discord.gg/zama)
