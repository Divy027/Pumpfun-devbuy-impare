import { Keypair } from "@solana/web3.js";

export type TokenConfig = {
    name: string;
    symbol: string;
    decimals: number;
    image: string;
    mint: Keypair;
    description: string;
    showName: boolean;
    createdOn: string;
    twitter: string;
    telegram: string;
    website: string;
}