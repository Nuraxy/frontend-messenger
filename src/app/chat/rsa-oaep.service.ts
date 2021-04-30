import {Injectable} from '@angular/core';
import {User} from '../user/user';

@Injectable({
  providedIn: 'root'
})
export class RsaOaepService {

  private ciphertext!: ArrayBuffer;

  constructor() {}

  public getMessageEncoding(message: string): Uint8Array {
    const enc = new TextEncoder();
    return enc.encode(message);
  }

  public async encryptMessage(publicKey: any, message: string): Promise<void> {
    const encoded = this.getMessageEncoding(message);
    this.ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      publicKey,
      encoded
    );
  }

  public async decryptMessage(privateKey: any, cipherMessage: ArrayBuffer): Promise<string> {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      privateKey,
      cipherMessage
    );
    // todo kann falsch sein wenn nicht klappt dann anderer decoder oder falsche schreibweise
    const enc = new TextDecoder('base-64');
    return enc.decode(decrypted);
  }

  public async generateKey(user: User): Promise<void>{
    const keyPairPromise = window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    ).then((keyPair) => {
      user.privateKey = keyPair.privateKey;
      user.publicKey = keyPair.publicKey;
    });
  }
}
