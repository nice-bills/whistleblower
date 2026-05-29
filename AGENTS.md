# Agent notes

## Product vision and default build decisions

- Build **Anonymous Whistleblower with selective disclosure**, not a generic encrypted document publisher. The public document CID is the disclosure layer; FHEVM protects the source context that Logos Whistleblower cannot protect.
- The Builder Track MVP should optimize for this demo: submit a public CID with encrypted source metadata, owner grants a journalist/investigator, owner shares one submission, the investigator decrypts the allowed metadata, and an outsider cannot decrypt it.
- Keep the document public by default. Do not encrypt the leaked file itself for v1; encrypt metadata that protects the source: reporter/pseudonym address, risk tier, and later contact/context fields.
- Treat `encryptedReporter` as a pseudonymous or throwaway source address for v1. Do not claim full anonymity because `msg.sender`, timing, gas funding, and IPFS upload paths can still leak information without relayers or account abstraction.
- Use a single owner/admin wallet for v1 investigator management. Multisig, DAO governance, request queues, and role hierarchies are later improvements.
- Prefer proactive owner sharing for v1: allowlist an investigator, then call `shareSubmissionWithInvestigator(submissionId, investigator)`. Investigator self-request flows can come after the core submit/share/decrypt path works.
- For the first frontend milestone, prioritize function over polish: wallet connect, file-to-CID or CID entry, encrypted submit, admin grant/share controls, investigator decrypt button, and clear outsider failure state.
- If storage integration is needed quickly, start with user-provided CID or a simple IPFS pinning provider path. Avoid adding heavy storage architecture until the FHEVM flow is demonstrably working.
- README, demo script, and UI copy should frame the project as **public permanent disclosure plus private selective source protection**.

## Cursor Cloud specific instructions

- Standard install/check commands are documented in `README.md` and root `package.json`; keep the VM startup update script limited to dependency refresh.
- Local end-to-end development uses two services: a Hardhat JSON-RPC node from `packages/contracts` on `127.0.0.1:8545`, and the Vite web app from the repo root on port `5173`.
- Hardhat may prompt for telemetry on first use in a fresh VM. Answer it before starting a persistent node, then leave the tmux-backed node running for browser tests.
- For the frontend's configured local path, start Vite with `VITE_CONTRACT_ADDRESS` set to the localhost deployment address and `VITE_CHAIN_ID=31337`; otherwise the Submit and Investigate stubs intentionally show "Set VITE_CONTRACT_ADDRESS" statuses.
- `hardhat node` runs `hardhat-deploy` on startup in this repo. Running `pnpm --filter @confidential-whistleblower/contracts deploy:localhost` afterward is still useful because it confirms or reuses the local `ConfidentialWhistleblower` deployment.
- The current frontend is scaffold-only. Browser smoke tests should verify the Submit and Investigate stub flows, while `pnpm test` is the authoritative local mock-FHE contract flow for submit, share, and decrypt behavior.
