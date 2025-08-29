import { Keypair } from "@solana/web3.js";
import { TokenConfig } from "./types";
import { createTokenBuy } from "./create_token_buy";
import base58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

const main = async () => {
    const wallet = Keypair.fromSecretKey(base58.decode(process.env.WALLET_SECRET_KEY || ""));
    const mint = Keypair.generate();
    // const mint = Keypair.fromSecretKey(base58.decode(""));
    const tokenConfig: TokenConfig = {
        name: "Test Token",
        symbol: "TT",
        decimals: 9,
        mint: mint,
        image: "./image.jpg",
        description: "Test Token Description",
        showName: true,
        createdOn: "2025-01-01",
        twitter: "https://x.com/pumpfun",
        telegram: "https://t.me/pumpfun",
        website: "https://pumpfun.io"
    }
    const tx = await createTokenBuy(wallet, tokenConfig, 0.001);
    console.log(tx);
}

main();