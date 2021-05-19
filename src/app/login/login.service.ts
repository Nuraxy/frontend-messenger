import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Token} from '../token';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
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

  public login(nameOrEmail: string, password: string): Observable<Token | null> {
    return this.http.post<Token>(`http://localhost:8080/users/authenticate`,
      {nameOrEmail, password}, {observe: 'response'})
      .pipe(map((response) => {
          const token = response.body;
          console.log(token);
          localStorage.setItem('token', JSON.stringify(token));
          if (token) {
          this.currentTokenSubject.next(token);
          if (token.user.publicKey == null){
            this.rsaoaepService.generateKey(token);
          }
        }
          return token;
        }
      ));
  }
}
