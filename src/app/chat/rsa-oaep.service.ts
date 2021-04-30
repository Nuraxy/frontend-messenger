import { Injectable } from '@angular/core';
import {from} from 'rxjs';
import {switchMap} from 'rxjs/operators';

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

  public async decryptMessage(privateKey: any, cipherMessage: ArrayBuffer): Promise<void> {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      privateKey,
      cipherMessage
    );
  }

  public async generateKey(): Promise<void>{
    const keyPairPromise = window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );
    console.log(keyPairPromise);
    from(keyPairPromise).pipe(
      switchMap(p => from(crypto.subtle.exportKey('jwk', p.publicKey)))
    ).subscribe(p => {
      console.log(p);
    });
  }
}
