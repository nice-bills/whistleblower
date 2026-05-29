# Agent notes

## Cursor Cloud specific instructions

- Standard install/check commands are documented in `README.md` and root `package.json`; keep the VM startup update script limited to dependency refresh.
- Local end-to-end development uses two services: a Hardhat JSON-RPC node from `packages/contracts` on `127.0.0.1:8545`, and the Vite web app from the repo root on port `5173`.
- Hardhat may prompt for telemetry on first use in a fresh VM. Answer it before starting a persistent node, then leave the tmux-backed node running for browser tests.
- For the frontend's configured local path, start Vite with `VITE_CONTRACT_ADDRESS` set to the localhost deployment address and `VITE_CHAIN_ID=31337`; otherwise the Submit and Investigate stubs intentionally show "Set VITE_CONTRACT_ADDRESS" statuses.
- `hardhat node` runs `hardhat-deploy` on startup in this repo. Running `pnpm --filter @confidential-whistleblower/contracts deploy:localhost` afterward is still useful because it confirms or reuses the local `ConfidentialWhistleblower` deployment.
- The current frontend is scaffold-only. Browser smoke tests should verify the Submit and Investigate stub flows, while `pnpm test` is the authoritative local mock-FHE contract flow for submit, share, and decrypt behavior.
