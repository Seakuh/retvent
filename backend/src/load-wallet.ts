// src/wallet/load-wallet.ts
import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';

export const loadCLIKeypair = (): Keypair => {
  const path = `${process.env.HOME}/.config/solana/id.json`;
  const secretKey = JSON.parse(fs.readFileSync(path, 'utf-8'));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
};
