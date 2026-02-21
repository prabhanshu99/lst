"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNativeTokens = exports.burnTokens = exports.mintTokens = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const bs58_1 = __importDefault(require("bs58"));
const address_1 = require("./address");
const connection = new web3_js_1.Connection(process.env.RPC_URL || "https://api.devnet.solana.com");
const mintTokens = (fromAddress, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Minting tokens");
    if (!address_1.PRIVATE_KEY || !address_1.TOKEN_MINT_ADDRESS) {
        throw new Error("Missing PRIVATE_KEY or TOKEN_MINT_ADDRESS");
    }
    const keypair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(address_1.PRIVATE_KEY));
    const mint = new web3_js_1.PublicKey(address_1.TOKEN_MINT_ADDRESS);
    const recipient = new web3_js_1.PublicKey(toAddress);
    const ata = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, keypair, mint, recipient);
    yield (0, spl_token_1.mintTo)(connection, keypair, mint, ata.address, keypair, amount);
});
exports.mintTokens = mintTokens;
const burnTokens = (fromAddress, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Burning tokens");
    if (!address_1.PRIVATE_KEY || !address_1.TOKEN_MINT_ADDRESS) {
        throw new Error("Missing PRIVATE_KEY or TOKEN_MINT_ADDRESS");
    }
    const keypair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(address_1.PRIVATE_KEY));
    const mint = new web3_js_1.PublicKey(address_1.TOKEN_MINT_ADDRESS);
    const account = new web3_js_1.PublicKey(fromAddress);
    const ata = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, account);
    yield (0, spl_token_1.burn)(connection, keypair, ata, mint, keypair, amount);
});
exports.burnTokens = burnTokens;
const sendNativeTokens = (fromAddress, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Sending native tokens");
    if (!address_1.PRIVATE_KEY) {
        throw new Error("Missing PRIVATE_KEY");
    }
    const keypair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(address_1.PRIVATE_KEY));
    const transferTransaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new web3_js_1.PublicKey(toAddress),
        lamports: amount,
    }));
    yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transferTransaction, [keypair]);
});
exports.sendNativeTokens = sendNativeTokens;
