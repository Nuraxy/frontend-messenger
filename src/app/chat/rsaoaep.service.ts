import {Injectable} from '@angular/core';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {Token} from '../token';
import {map, tap} from 'rxjs/operators';
import {flatMap} from 'rxjs/internal/operators';
import {Base64} from 'js-base64';
import {User} from '../user/user';

@Injectable({
  providedIn: 'root'
})
export class RsaoaepService {

  currentTokenSubject: BehaviorSubject<Token>;
  public currentTokenObservable: Observable<Token>;
  public currentToken!: Token;
  public privateKey: CryptoKey | undefined;

  constructor() {
    this.currentTokenSubject = new BehaviorSubject<Token>(JSON.parse(localStorage.getItem('token') as string));
    this.currentTokenObservable = this.currentTokenSubject.asObservable();
    this.currentTokenObservable.subscribe( (token) => {
      this.currentToken = token;
    });
  }

  public get currentTokenValue(): Token {
    return this.currentTokenSubject.value;
  }

  public generateKeys(): Observable<string> {
    return from(window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        // Consider using a 4096-bit key for systems that require long-term security
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    )).pipe(
      flatMap((keyPair) => {
        this.privateKey = keyPair.privateKey;

        return this.exportCryptoKey(keyPair.publicKey);
      })
    );
  }

  public encryptMessage(message: string, userToSendTo: User): Observable<string> {
    const enc = new TextEncoder();
    const encoded = enc.encode(message);
    console.log('User for Import: ', this.currentToken);
    let publicKey = 'missing';
    if (userToSendTo.publicKey !== undefined){
      publicKey = userToSendTo.publicKey;
    }
    return from(this.importPublicKey(publicKey)).pipe(
      flatMap((importedKey) => {
        return from(
          window.crypto.subtle.encrypt(
            {name: 'RSA-OAEP'},
            importedKey,
            encoded
          )
        ).pipe(
          map((encrypted) => {
            const uint8Array = new Uint8Array(encrypted);
            const base64 = Base64.fromUint8Array(uint8Array);
            console.log('encrypted', encrypted);
            console.log('uint8Array:', uint8Array);
            console.log('base64: ' + base64);
            return base64;
          })
        );
      }),
    );
  }

  public decryptMessage(input: string): Observable<string> {
    const uint8Array = Base64.toUint8Array(input);
    console.log('Decrypt uint8Array: ', uint8Array);
    if (this.privateKey) {
      return from(window.crypto.subtle.decrypt(
        {name: 'RSA-OAEP'},
        this.privateKey,
        uint8Array
      )).pipe(
        map((decrypted) => {
          const dec = new TextDecoder();
          console.log('Decrypted richtig: ' + dec.decode(decrypted));
          return dec.decode(decrypted);
        })
      );
    } else {
      return Observable.throw(new Error('error1'));
    }
  }

  exportCryptoKey(key: CryptoKey): Observable<string> {
    return from(window.crypto.subtle.exportKey(
      'spki',
      key
    )).pipe(
      map((exported) => {
        const exportedKeyBuffer = new Uint8Array(exported);
        const numberArray = [...exportedKeyBuffer];
        const exportedAsString = String.fromCharCode.apply(null, numberArray);
        const exportedAsBase64 = window.btoa(exportedAsString);
        // return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
        return exportedAsBase64;
      })
    );
  }

  importPublicKey(key: string): Promise<CryptoKey> {
    // const pemHeader = '-----BEGIN PUBLIC KEY-----\n';
    // const pemFooter = '\n-----END PUBLIC KEY-----';
    // const pemContents = key.substring(pemHeader.length, key.length - pemFooter.length);
    // const binaryDerString = window.atob(pemContents);
    const binaryDerString = window.atob(key);
    const buf = new ArrayBuffer(binaryDerString.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = binaryDerString.length; i < strLen; i++) {
      bufView[i] = binaryDerString.charCodeAt(i);
    }
    return window.crypto.subtle.importKey(
      'spki',
      bufView,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['encrypt']
    );
  }

}
