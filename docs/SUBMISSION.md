# Zama Developer Program — Bounty Track checklist

**Season 3** · Deadline **2026-07-07 23:59 AOE**

## Project

**Confidential Wrapper Registry** — explorer + wrap/unwrap + EIP-712 balance decrypt + Sepolia cTokenMock faucet for the official Zama Wrappers Registry.

## Bounty requirements mapping

| Requirement | Status | Notes |
|-------------|--------|-------|
| List all registry pairs (Sepolia + mainnet) | Implemented | `useListPairs` with metadata, pagination, valid/revoked filter |
| Wrap any valid pair | Implemented | `useShield` on pair detail |
| Unwrap any valid pair | Implemented | `useUnshield` / `useUnshieldAll` |
| Decrypt ERC-7984 balance (EIP-712) | Implemented | `useAllow` + `useConfidentialBalance` |
| Sepolia faucet for official cTokenMocks | Implemented | `mint` on documented mock underlying tokens |

## Before submit

- [ ] Record a short demo video (registry browse → faucet mint → wrap → decrypt → unwrap)
- [ ] Deploy frontend (Vercel / Cloudflare Pages / similar) with public URL
- [ ] Submit via official **Bounty Track** form on the [Season 3 post](https://www.zama.org/post/zama-developer-program-mainnet-season-3-composable-privacy-is-the-key)
- [ ] Share on X tagging **@zama** with **#ZamaDeveloperProgram**

## Suggested demo script

1. Open registry on Sepolia — show pair count and valid badges (30s)
2. Faucet: mint cUSDCMock underlying (30s)
3. Open pair — wrap 100 tokens (45s)
4. Authorize EIP-712 decrypt — show confidential balance (45s)
5. Unwrap back to ERC-20 (30s)
6. Switch to mainnet — show mainnet pairs load from same UI (20s)

## Rewards (reference)

| Place | cUSDT |
|-------|-------|
| 1st | 1,500 |
| 2nd | 1,000 |
| 3rd | 500 |

## Support

- developer@zama.org
- [Discord](https://discord.gg/zama)
