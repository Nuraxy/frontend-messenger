import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, from, Observable, of} from 'rxjs';
import {Token} from '../token';
import {HttpClient} from '@angular/common/http';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {RsaoaepService} from '../chat/rsaoaep.service';

@Injectable({providedIn: 'root'})
export class LoginService {
  currentTokenSubject: BehaviorSubject<Token>;
  public currentToken: Observable<Token>;

  constructor(private http: HttpClient, private rsaoaepService: RsaoaepService) {
    this.currentTokenSubject = new BehaviorSubject<Token>(JSON.parse(localStorage.getItem('token') as string));
    this.currentToken = this.currentTokenSubject.asObservable();
  }

  public get currentTokenValue(): Token {
    return this.currentTokenSubject.value;
  }

  public login(nameOrEmail: string, password: string): Observable<Token> {
    return this.http.post<Token>(`http://localhost:8080/users/authenticate`,
      {nameOrEmail, password}, {observe: 'response'})
      .pipe(
        map(response => response.body),
        filter(token => token != null),
        map(token => token as Token),
        tap((token: Token) => this.currentTokenSubject.next(token)),
        mergeMap((token: Token) => {
          if (token.user.publicKey == null) {
            return this.generateKeys(token);
          } else {
            return of(token);
          }
        }),
        tap(token => localStorage.setItem('token', JSON.stringify(token)))
      );
  }

  private generateKeys(token: Token): Observable<Token> {
    return from(this.rsaoaepService.generateKey()).pipe(
      mergeMap(keyPair => {
        return from(crypto.subtle.exportKey('jwk', keyPair.publicKey)).pipe(
          tap(exported => {
            localStorage.setItem('publicKey', JSON.stringify(exported));
            token.user.publicKey = JSON.stringify(exported);
          }),
          map(() => keyPair)
        );
      }),
      mergeMap(keyPair => {
        return from(crypto.subtle.exportKey('jwk', keyPair.privateKey)).pipe(
          tap(exported => {
            localStorage.setItem('privateKey', JSON.stringify(exported));
            token.user.privateKey = JSON.stringify(exported);
          }),
          map(() => keyPair)
        );
      }),
      map(() => token)
    );
  }

  private generateKeys2(token: Token): Observable<Token> {
    return from(this.rsaoaepService.generateKey()).pipe(
      mergeMap(keyPair => {
        return forkJoin([
          from(crypto.subtle.exportKey('jwk', keyPair.publicKey)),
          from(crypto.subtle.exportKey('jwk', keyPair.privateKey))
        ]).pipe(
          tap(([publicExported, privateExported]) => {
            localStorage.setItem('publicKey', JSON.stringify(publicExported));
            token.user.publicKey = JSON.stringify(publicExported);
            localStorage.setItem('privateKey', JSON.stringify(privateExported));
            token.user.privateKey = JSON.stringify(privateExported);
          })
        );
      }),
      map(() => token)
    );
  }
}
