export class User {
  userId!: number;
  name!: string;
  password?: string;
  email?: string;
  publicKey?: CryptoKey;
  privateKey?: CryptoKey;
}
