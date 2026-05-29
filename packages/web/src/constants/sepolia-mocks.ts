/** Official Sepolia cTokenMocks with public underlying mint (1M per call). */
export const SEPOLIA_MOCK_FAUCET_TOKENS = [
  {
    name: "USDC (Mock)",
    symbol: "USDCMock",
    underlying: "0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF" as const,
    confidential: "0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639" as const,
    decimals: 6,
  },
  {
    name: "USDT (Mock)",
    symbol: "USDTMock",
    underlying: "0xa7dA08FafDC9097Cc0E7D4f113A61e31d7e8e9b0" as const,
    confidential: "0x4E7B06D78965594eB5EF5414c357ca21E1554491" as const,
    decimals: 6,
  },
  {
    name: "WETH (Mock)",
    symbol: "WETHMock",
    underlying: "0xff54739b16576FA5402F211D0b938469Ab9A5f3F" as const,
    confidential: "0x46208622DA27d91db4f0393733C8BA082ed83158" as const,
    decimals: 18,
  },
  {
    name: "BRON (Mock)",
    symbol: "BRONMock",
    underlying: "0xFf021fB13cA64e5354c62c954b949a88cfDEb25E" as const,
    confidential: "0xaa5612FA27c927a0c7961f5AEFEE5ba3A0F9C891" as const,
    decimals: 18,
  },
  {
    name: "ZAMA (Mock)",
    symbol: "ZAMAMock",
    underlying: "0x75355a85c6FB9df5f0C80FF54e8747EEe9a0BF57" as const,
    confidential: "0xf2D628d2598aF4eAF94CB76a437Ff86CA78FfbFB" as const,
    decimals: 18,
  },
  {
    name: "tGBP (Mock)",
    symbol: "tGBPMock",
    underlying: "0x93c931278A2aad1916783F952f94276eA5111442" as const,
    confidential: "0xfCE5c7069c5525eF6c8C2b2E35A745bA20a2F7CC" as const,
    decimals: 18,
  },
  {
    name: "XAUt (Mock)",
    symbol: "XAUtMock",
    underlying: "0x24377AE4AA0C45ecEe71225007f17c5D423dd940" as const,
    confidential: "0xe4FcF848739845BC81Dee1d5352cf3844F0a60C7" as const,
    decimals: 6,
  },
] as const;

export const MINT_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

/** Default mint amount per faucet click (human units). */
export const DEFAULT_FAUCET_MINT_UNITS = 10_000n;
