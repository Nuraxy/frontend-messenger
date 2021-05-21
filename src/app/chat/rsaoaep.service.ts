import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Token} from '../token';
@Injectable({
  providedIn: 'root'
})
export class RsaoaepService {

  private ciphertext!: ArrayBuffer;
  currentTokenSubject: BehaviorSubject<Token>;
  public currentToken: Observable<Token>;

  constructor() {
    this.currentTokenSubject = new BehaviorSubject<Token>(JSON.parse(localStorage.getItem('token') as string));
    this.currentToken = this.currentTokenSubject.asObservable();
  }

  public get currentTokenValue(): Token {
    return this.currentTokenSubject.value;
  }

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

  public generateKey(/*currentToken: Token*/): Promise<CryptoKeyPair> {
    return window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );
      // .then((keyPair) => {
      // crypto.subtle.exportKey('jwk', keyPair.publicKey)
      //   .then(exported => {
      //     localStorage.setItem('publicKey', JSON.stringify(exported));
      //     currentToken.user.publicKey = JSON.stringify(exported);
      //   })
      //   @ts-ignore
        // .then(() => console.log('TEST -- ' + localStorage.getItem('publicKey').toString()));
      // currentToken.user.privateKey = keyPair.privateKey;
    // });
  }
}
