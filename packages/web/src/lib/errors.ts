import {
  InsufficientERC20BalanceError,
  SigningRejectedError,
  TransactionRevertedError,
  ZamaError,
} from "@zama-fhe/react-sdk";

export function formatTxError(error: unknown): string {
  if (error instanceof SigningRejectedError) {
    return "Wallet rejected the signature or transaction.";
  }
  if (error instanceof InsufficientERC20BalanceError) {
    return "Insufficient public token balance for this action.";
  }
  if (error instanceof TransactionRevertedError) {
    return "Transaction reverted on-chain. Check allowance, pair validity, and network.";
  }
  if (error instanceof ZamaError) {
    return error.message;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("user rejected") || msg.includes("user denied")) {
      return "Wallet rejected the request.";
    }
    if (msg.includes("wrong network") || msg.includes("chain")) {
      return "Switch your wallet to Sepolia or Ethereum mainnet.";
    }
    return error.message;
  }
  return "Something went wrong. Try again.";
}
