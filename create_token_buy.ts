import { openAsBlob } from "fs";
import {
  PublicKey,
  SystemProgram,
  TransactionMessage,
  Keypair,
  VersionedTransaction,
  TransactionInstruction,
  Connection,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import base58 from "bs58";
import { TokenConfig } from "./types";
import { getUploadedMetadataURI } from "./pumpfun-sdk/uploadToIpfs";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { PumpFunSDK } from "./pumpfun-sdk/pumpfun";
import { getBuyTokenAmountFromSolAmount, PumpSdk } from "@pump-fun/pump-sdk";
import dotenv from "dotenv";

dotenv.config();

const connection = new Connection(process.env.RPC_URL || "", "confirmed");

export let Oldsdk = new PumpFunSDK(new AnchorProvider(connection, new NodeWallet(new Keypair()), { commitment: "confirmed" }));
export let sdk = new PumpSdk(connection);
// const createTokenTx = async (wallet:Keypair, tokenConfig:TokenConfig) => {
//     const tokenInfo = {
//         name: tokenConfig.name,
//         symbol: tokenConfig.symbol,
//         description: tokenConfig.description,
//         showName: tokenConfig.showName,
//         createOn: tokenConfig.createdOn,
//         twitter: tokenConfig.twitter,
//         telegram: tokenConfig.telegram,
//         website: tokenConfig.website,
//         file: await openAsBlob(tokenConfig.image),
//     };
//     let tokenMetadata = await sdk.createTokenMetadata(tokenInfo);

//     let createIx = await sdk.getCreateInstructions(
//         wallet.publicKey,
//         tokenInfo.name,
//         tokenInfo.symbol,
//         tokenMetadata.metadataUri,
//         tokenConfig.mint
//     );

//     return createIx;
// }

// // make buy instructions
// const makeBuyIx = async (kp: Keypair, buyAmount: number, mint: PublicKey, index: number, creator: PublicKey) => {
//     let buyIx = await sdk.getBuyInstructionsBySolAmount(
//         creator,
//         kp.publicKey,
//         mint,
//         BigInt(buyAmount),
//         index
//     );

//     return buyIx
// }

export const createTokenBuy = async (
  wallet: Keypair,
  tokenConfig: TokenConfig,
  solAmount: number
) => {
  const buyAmount = solAmount * LAMPORTS_PER_SOL;
  const global = await sdk.fetchGlobal();
  const tokenInfo = {
    name: tokenConfig.name,
    symbol: tokenConfig.symbol,
    description: tokenConfig.description,
    showName: tokenConfig.showName,
    createOn: tokenConfig.createdOn,
    twitter: tokenConfig.twitter,
    telegram: tokenConfig.telegram,
    website: tokenConfig.website,
    file: await openAsBlob(tokenConfig.image),
  };
  let tokenMetadata = await Oldsdk.createTokenMetadata(tokenInfo);
  const instructions = await sdk.createAndBuyInstructions({
    global,
    mint: tokenConfig.mint.publicKey,
    name: tokenConfig.name,
    symbol: tokenConfig.symbol,
    uri: tokenMetadata.metadataUri,
    creator: wallet.publicKey,
    user: wallet.publicKey,
    solAmount: new BN(buyAmount),
    amount: getBuyTokenAmountFromSolAmount({
      global,
      feeConfig: null,
      mintSupply: null,
      bondingCurve: null,
      amount: new BN(buyAmount),
    }),
  });
  const latestBlockhash = await connection.getLatestBlockhash();

  if (instructions.length === 0) {
    throw new Error("Failed to create token or buy instruction");
  }
  const tx = new VersionedTransaction(
    new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: instructions,
    }).compileToV0Message()
  );
  tx.sign([wallet, tokenConfig.mint]);

  const txHash = await connection.sendRawTransaction(tx.serialize());
  return txHash;
};
