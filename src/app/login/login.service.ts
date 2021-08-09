import {Injectable} from '@angular/core';
import {BehaviorSubject, from, Observable, of} from 'rxjs';
import {Token} from '../token';
import {HttpClient} from '@angular/common/http';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {RsaoaepService} from '../messenger/rsaoaep.service';
import {IndexedDBService} from '../messenger/indexed-db.service';
import {environment} from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class LoginService {
  currentTokenSubject: BehaviorSubject<Token>;
  public currentToken: Observable<Token>;

  constructor(private http: HttpClient, private rsaoaepService: RsaoaepService, private indexedDBService: IndexedDBService) {
    this.currentTokenSubject = new BehaviorSubject<Token>(JSON.parse(localStorage.getItem('token') as string));
    this.currentToken = this.currentTokenSubject.asObservable();
  }

  public get currentTokenValue(): Token {
    return this.currentTokenSubject.value;
  }

  public login(nameOrEmail: string, password: string): Observable<Token> {
    return this.http.post<Token>(`http://localhost:8079/users/authenticate`,
      {nameOrEmail, password}, {observe: 'response'})
      .pipe(
        mergeMap((response) => {
          return from(this.indexedDBService.connectToDb()).pipe(
            map(() => response)
          );
        }),
        map(response => response.body),
        filter(token => token != null),
        map(token => token as Token),
        tap((token: Token) => this.currentTokenSubject.next(token)),
        mergeMap((token: Token) => {
          // todo || token.user.publicKey != null
          if (token.user.publicKey == null) {
            return this.rsaoaepService.generateKeys().pipe(
              map((publicKeyString: string) => {
                token.user.publicKey = publicKeyString;
                return token;
              }),
              tap((t: Token) => localStorage.setItem('token', JSON.stringify(t)))
            );
          } else {
            return of(token);
          }
        })
      );
  }

  logout(): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}users/logout/${this.currentTokenValue.tokenId}`)
      .pipe(
        tap(() => localStorage.removeItem('token'))
      );
  }

}
