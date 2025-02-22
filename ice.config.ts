import { ICE, motokoCanister, task } from "@ice.ts/runner"
import {
  InternetIdentity,
  ICRC1Ledger,
  DIP721,
  Ledger,
  DIP20,
  Cap,
  CapRouter,
  NNSScope,
  CandidUI,
  ICRC7NFT,
  CyclesWallet,
  CyclesLedger,
  NFIDScope,
} from "@ice.ts/canisters"
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc"
import { LedgerCanister } from "@dfinity/ledger-icp"
import { GovernanceCanister } from "@dfinity/nns"
import { Principal } from "@dfinity/principal"

export const icrc1_ledger = ICRC1Ledger(({ ctx }) => ({
  // TODO: Principal causes issues
  // custodians: [{ owner: ctx.users.default.principal, subaccount: [] }],
  name: "Test Ledger",
  symbol: "TEST",
  logo: "https://example.com/logo.png",
  // TODO: wrong format!
  // minting_account: { owner: ctx.users.default.principal, subaccount: [] },
  minting_account: ctx.users.default.principal.toString(),
  // TODO: wrong format!
  // controller_id: [{owner: ctx.users.default.principal, subaccount: []}],
  // controller_id: {owner: ctx.users.default.principal, subaccount: []},
  controller_id: ctx.users.default.principal.toString(),
})).done()

export const internet_identity = InternetIdentity(({ ctx }) => ({
  owner: ctx.users.default.principal.toString(),
  assignedUserNumberRange: [0n, 10000n],
})).done()

export const dip721 = DIP721(({ ctx }) => ({
  name: "Test DIP721 ICE",
  symbol: "TEST",
  logo: "https://example.com/logo.png",
  custodians: [ctx.users.default.principal.toString()],
}))
// .installArgs(async ({ ctx }) => {
//   return []
// })


export const ledger = Ledger(({ ctx }) => ({
  minting_account: ctx.users.default.accountId,
  initial_values: {
    [ctx.users.default.accountId]: 1_000_000_000,
  },
})).done()

export const cap_router = CapRouter({}).done()

export const dip20 = DIP20(({ ctx }) => ({
  name: "Test DIP20 ICE",
  symbol: "TEST",
  logo: "https://example.com/logo.png",
  decimals: 18,
  totalSupply: 1_000_000_000,
  owner: ctx.users.default.principal.toString(),
  fee: 0,
  feeTo: ctx.users.default.principal.toString(),
}))
  //   // TODO: provide better errors somehow?
  //   // can provide warn us that we are using the correct keys?
  .deps({
    // TODO: allow providing the whole CanisterScope
    CapRouter,
  })
  // .done()

export const ice_test_backend = motokoCanister({
  src: "canisters/ice_test_backend/main.mo",
  // TODO: ?
  // description: "ICE Test Backend",
})
  // .deps({
  //   CapRouter: cap_router.children.install,
  // })
  // TODO: move from ctx to deps
  .installArgs(async ({ ctx }) => {
    // const capRouter = ctx.dependencies.CapRouter.actor
    // const hash = await capRouter.git_commit_hash()
    // console.log("hash", hash)
    return []
  })

// TODO: should be a constructor
export const nns = NNSScope()
// // TODO: scopes should preserve types
// nns.children.NNSGovernance

export const candid_ui = CandidUI()

export const icrc7_nft = ICRC7NFT({})

export const cycles_wallet = CyclesWallet({})

export const cycles_ledger = CyclesLedger({}).done()

export const mint_tokens = task("mint tokens")
  .deps({
    // TODO: allow passing in CanisterConstructor & CanisterScope, etc.
    icrc1_ledger,
    ledger,
  })
  .run(async ({ ctx }) => {
    const {
      icrc1_ledger,
      ledger: icp_ledger,
    } = ctx.dependencies
    // const icrc1_ledger_actor = icrc1_ledger.actor
    // const ledger_actor = ledger.actor
    // const nns_governance_actor = nns_governance.actor
    const defaultUser = ctx.users.default

    const ledger = LedgerCanister.create({
      // @ts-ignore
      agent: defaultUser.agent,
      canisterId: Principal.fromText(icp_ledger.canisterId),
    })

    const balance = await ledger.accountBalance({
      accountIdentifier: defaultUser.accountId,
    })
    console.log("balance", balance)

    // TODO: mint tokens

    // const proposals = await gov.listProposals()
    // console.log("proposals", proposals)

    // const amount = 1000000000000000000n
  })

export const cycles_balance = task()
  .deps({
    cycles_ledger
  })
  .run(async ({ ctx }) => {
    const {
      cycles_ledger: { actor },
    } = ctx.dependencies
    const balance = await actor.icrc1_balance_of({
      owner: ctx.users.default.principal,
      subaccount: [],
    })
    const totalSupply = await actor.icrc1_minting_account()
    // TODO: error do not know how to serialize bigint
    const result = await actor.icrc1_transfer({
      from_subaccount: [[0]],
      to: {
        owner: Principal.from(ctx.users.default.principal),
        subaccount: [],
      },
      fee: [0n],
      memo: [],
      created_at_time: [0n],
      amount: 1000000000000000000n,
    })
    // console.log("balance", balance)
  })

// TODO:
// export const cycles = task()
//   .dependsOn({
//     cycles_ledger
//   })
//   .dependsOn({
//     cycles_ledger
//   })
//   .run(async ({ ctx, deps }) => {
//     const {
//       cycles_ledger: { actor },
//     } = deps
//     const balance = await actor.icrc1_balance_of({
//       // @ts-ignore
//       owner: ctx.users.default.principal,
//       subaccount: [],
//     })
//     console.log("balance", balance)
//   })

// const makeCycles = () => cycles()

export const cycles_metadata = task("description of task")
  .deps({
    cycles_ledger,
    icrc1_ledger,
  })
  .run(async ({ ctx }) => {
    const {
      cycles_ledger,
      icrc1_ledger,
    } = ctx.dependencies
    const metadata = await cycles_ledger.actor.icrc1_metadata()
    // const balance = await cycles_balance.done()
    // // TODO: allow passing in args
    // // TODO: fix runTask type
    // const result = await ctx.runTask(balance, {
    //   args: ["my args"]
    // })
    const decimals = await cycles_ledger.actor.icrc1_decimals()
    const symbol = await cycles_ledger.actor.icrc1_symbol()
    const name = await cycles_ledger.actor.icrc1_name()
    const minting_account = await cycles_ledger.actor.icrc1_minting_account()
    // // const balance = await icrc1_ledger.actor.icrc1_balance_of({
    // //   owner: ctx.users.default.principal,
    // //   subaccount: [],
    // // })
    console.log("metadata", metadata)
    // console.log("balance", balance)
  })

  // TODO: for extension
  // - errors not displayed
  // - old logs displayed if user adds new lines of code, because they are indexed by line number
  // - commented out code shows results still
  // - logs should perhaps be wiped
  // - should we monkey patch console.log and display also those?


// // TODO: npx ice should deploy & run all tasks?
// // TODO: allow deploying all children of a scope
// // TODO: add deploy as defaultTask to scopes
export const nfid = NFIDScope()

export const log = task()
  .deps({
    nfid: nfid.children.identityManager,
  })
  .run(async ({ ctx }) => {
    const personas = await ctx.dependencies.nfid.actor.read_personas()
    console.log("personas", personas)
  })

// // nfid.children.