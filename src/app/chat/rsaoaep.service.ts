import {Injectable} from '@angular/core';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {Token} from '../token';
import {map, mergeMap} from 'rxjs/operators';
import {flatMap} from 'rxjs/internal/operators';
import {Base64} from 'js-base64';

@Injectable({
  providedIn: 'root'
})
export class RsaoaepService {

  currentTokenSubject: BehaviorSubject<Token>;
  public currentToken: Observable<Token>;
  public publicKeyString = 'missing';
  public privateKey: CryptoKey | undefined;

  constructor() {
    this.currentTokenSubject = new BehaviorSubject<Token>(JSON.parse(localStorage.getItem('token') as string));
    this.currentToken = this.currentTokenSubject.asObservable();
  }

  public get currentTokenValue(): Token {
    return this.currentTokenSubject.value;
  }

  public generateKeys(): void {
    from(window.crypto.subtle.generateKey(
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
      mergeMap((keyPair) => {
        this.privateKey = keyPair.privateKey;
        return from(this.exportCryptoKey(keyPair.publicKey)).pipe(
          map((keyString: string) => keyString)
        );
      }),
      mergeMap(() => {
        return this.encryptMessage('Please kill me !!!').pipe(
          map((testMessage: string) => testMessage)
        );
      }),
      mergeMap((testMessage: string) => {
        console.log('Verschlüsselt: ' + testMessage);
        return this.decryptMessage(testMessage);
      })
    ).subscribe(text => {
      console.log('Entschlüsselt: ' + text);
    });


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
        const keyExport = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
        this.publicKeyString = keyExport;
        localStorage.setItem('publicKey', keyExport);
        return keyExport;
      })
    );
  }

  importPublicKey(key: string): Promise<CryptoKey> {
    // fetch the part of the PEM string between header and footer
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = key.substring(pemHeader.length, key.length - pemFooter.length);
    // base64 decode the string to get the binary data
    const binaryDerString = window.atob(pemContents);
    // convert from a binary string to an ArrayBuffer
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

  public encryptMessage(message: string): Observable<string> {
    const enc = new TextEncoder();
    const encoded = enc.encode(message);
    return from(this.importPublicKey(this.publicKeyString)).pipe(
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
    // const dec = new TextDecoder();
    // let arrayBuffer: ArrayBuffer;
    // arrayBuffer = this.messageToUint8Array(input);
    // console.log(arrayBuffer);
    // const forDecode = this.messageToUint8Array(arrayBuffer);
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

}
