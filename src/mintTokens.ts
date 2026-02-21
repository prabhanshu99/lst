import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { mintTo, getOrCreateAssociatedTokenAccount, burn, getAssociatedTokenAddress } from "@solana/spl-token";
import bs58 from "bs58";
import { PRIVATE_KEY, TOKEN_MINT_ADDRESS } from "./address";

const connection = new Connection(process.env.RPC_URL || "https://api.devnet.solana.com");

export const mintTokens = async (fromAddress: string, toAddress: string, amount: number) => {
    console.log("Minting tokens");
    if (!PRIVATE_KEY || !TOKEN_MINT_ADDRESS) {
        throw new Error("Missing PRIVATE_KEY or TOKEN_MINT_ADDRESS");
    }

    const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
    const mint = new PublicKey(TOKEN_MINT_ADDRESS);
    const recipient = new PublicKey(toAddress);

    const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        keypair,
        mint,
        recipient
    );

    await mintTo(
        connection,
        keypair,
        mint,
        ata.address,
        keypair,
        amount
    );
}

export const burnTokens = async (fromAddress: string, toAddress: string, amount: number) => {
    console.log("Burning tokens");
    if (!PRIVATE_KEY || !TOKEN_MINT_ADDRESS) {
        throw new Error("Missing PRIVATE_KEY or TOKEN_MINT_ADDRESS");
    }

    const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
    const mint = new PublicKey(TOKEN_MINT_ADDRESS);

    // We burn from the SERVER's ATA (where the user sent the tokens)
    const ata = await getAssociatedTokenAddress(mint, keypair.publicKey);

    await burn(
        connection,
        keypair,
        ata,
        mint,
        keypair,
        amount
    );
}

export const sendNativeTokens = async (fromAddress: string, toAddress: string, amount: number) => {
    console.log("Sending native tokens");
    if (!PRIVATE_KEY) {
        throw new Error("Missing PRIVATE_KEY");
    }

    const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
    const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: new PublicKey(toAddress), // Sending to the user
            lamports: amount,
        })
    );

    await sendAndConfirmTransaction(connection, transferTransaction, [keypair]);
}
