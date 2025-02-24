import { customCanister, ICE, motokoCanister, task } from "@ice.ts/runner"
import {
  InternetIdentity,
  ICRC1Ledger,
  DIP721,
  Ledger,
  DIP20,
  CapRouter,
  NNS,
  CandidUI,
  ICRC7NFT,
  CyclesWallet,
  CyclesLedger,
  NFID,
} from "@ice.ts/canisters"
import { Principal } from "@dfinity/principal"
import { Ed25519KeyIdentity } from "@dfinity/identity"

// Example motoko canister
export const ice_test_backend = motokoCanister({
  src: "canisters/ice_test_backend/main.mo",
})

// Example custom canister
// export const ice_custom_canister = customCanister({
// 	wasm: "path/to/canister.wasm",
// 	candid: "path/to/canister.did",
// })

export const nns = NNS()

export const candid_ui = CandidUI()

export const cycles_wallet = CyclesWallet().done()

export const cycles_ledger = CyclesLedger().done()

//////////////////////////////////////////
// Identity providers
//////////////////////////////////////////

export const internet_identity = InternetIdentity(({ ctx }) => ({
  assignedUserNumberRange: [0n, 1000n],
  owner: ctx.users.default.principal.toString(),
}))

export const nfid = NFID()

//////////////////////////////////////////
// Tokens
//////////////////////////////////////////

export const ledger = Ledger(({ ctx }) => ({
  minting_account: ctx.users.default.accountId,
  initial_values: {
    [ctx.users.default.accountId]: 1_000_000_000,
  },
})).done()

export const icrc1_ledger = ICRC1Ledger(({ ctx }) => ({
  custodians: [{ owner: ctx.users.default.principal, subaccount: [] }],
  name: "Test ICRC1",
  symbol: "TEST",
  logo: "https://example.com/logo.png",
  minting_account: ctx.users.default.principal.toString(),
  controller_id: ctx.users.default.principal.toString(),
})).done()

export const icrc7_nft = ICRC7NFT()

export const cap_router = CapRouter()

export const dip20 = DIP20(({ ctx }) => ({
  name: "Test DIP20",
  symbol: "TEST",
  logo: "https://example.com/logo.png",
  decimals: 18,
  totalSupply: 1_000_000_000,
  owner: ctx.users.default.principal.toString(),
  fee: 0,
  feeTo: ctx.users.default.principal.toString(),
}))
  .deps({
    CapRouter,
  })
  .done()

export const dip721 = DIP721(({ ctx }) => ({
  name: "Test DIP721",
  symbol: "TEST",
  logo: "https://example.com/logo.png",
  custodians: [ctx.users.default.principal.toString()],
})).done()

//////////////////////////////////////////
// Tasks
//////////////////////////////////////////

const testUser = {
  owner: Principal.fromText(
    "hjkc3-vpvrr-33owh-ltwre-clyp4-jn2g6-ztrkn-bkuth-zmcnq-hflkp-lqe",
  ),
  subaccount: [] as [],
}

export const mint_tokens = task("mint tokens")
  .deps({
    icrc1_ledger,
  })
  .run(async ({ ctx, deps: { icrc1_ledger } }) => {
    await icrc1_ledger.actor.icrc1_transfer({
      to: testUser,
      fee: [],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      amount: 1000000000n,
    })

    const balance = await icrc1_ledger.actor.icrc1_balance_of(testUser)
    const symbol = await icrc1_ledger.actor.icrc1_symbol()

    console.log(`balance: ${balance} ${symbol}`)
  })
