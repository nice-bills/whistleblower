#!/usr/bin/env bash
# Starts the web app with a mock connected wallet for screen recording.
# On-chain txs still require Sepolia ETH on the mock account (use your own wallet for real demos).
set -euo pipefail
cd "$(dirname "$0")/.."
export VITE_DEMO_MOCK_WALLET=true
exec pnpm --filter @confidential-wrapper-registry/web dev --host 0.0.0.0 --port 5173
