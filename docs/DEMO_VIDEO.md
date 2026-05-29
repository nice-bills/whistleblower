# Bounty demo video

## Recorded assets

Cloud agent recordings (in the VM artifacts folder):

| File | Description |
|------|-------------|
| **`/opt/cursor/artifacts/wrapper-registry-bounty-demo.mp4`** | Full walkthrough (~7 min): registry, mainnet switch, faucet, pair flow, mock wallet |
| **`/opt/cursor/artifacts/wrapper-registry-bounty-demo-3min.mp4`** | Same content sped up (~3 min) for bounty form length limits |

Copy it locally:

```bash
# from your machine if you have artifact sync
cp /opt/cursor/artifacts/wrapper-registry-bounty-demo.mp4 ./wrapper-registry-demo.mp4
```

## Suggested script (~3 min)

Matches [`SUBMISSION.md`](./SUBMISSION.md):

1. **Registry (Sepolia)** — pair count, valid badges, search, pagination  
2. **Faucet** — mint mock underlying (Sepolia)  
3. **Pair** — wrap → EIP-712 decrypt → show confidential balance → unwrap  
4. **Mainnet** — switch network in header, show registry loads on mainnet  

## Record locally (recommended for on-chain steps)

The cloud VM has no browser wallet, so mint/wrap/decrypt need your machine:

```bash
pnpm install
pnpm dev
# open http://localhost:5173 — MetaMask on Sepolia with test ETH
```

Use any screen recorder (OBS, QuickTime, etc.) and follow the script above.

### Optional: mock wallet for UI-only recording

```bash
./scripts/record-demo.sh
```

Sets `VITE_DEMO_MOCK_WALLET=true` (auto-connected test account). Registry browsing and network switching work; transactions need Sepolia ETH on that account or a real injected wallet.

## Checklist

- [ ] Video shows all four areas: registry, faucet, pair flows, mainnet switch  
- [ ] Upload to submission form / host link in README  
- [ ] Tweet tagging @zama with #ZamaDeveloperProgram  
