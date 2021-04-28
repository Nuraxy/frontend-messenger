import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Token} from '../token';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class LoginService {
  currentTokenSubject: BehaviorSubject<Token>;
  public currentToken: Observable<Token>;

  constructor(private http: HttpClient) {
    this.currentTokenSubject = new BehaviorSubject<Token>(JSON.parse(<string> localStorage.getItem('token')));
    this.currentToken = this.currentTokenSubject.asObservable();
  }

  public get currentTokenValue(): Token {
    return this.currentTokenSubject.value;
  }

  public login(username: string, password: string, pKey: number, qKey: number): Observable<Token | null> {
    return this.http.post<Token>(`http://localhost:8080/users/authenticate`,
      {username, password, pKey, qKey}, {observe: 'response'})
      .pipe(map((response) => {
          const token = response.body;
          console.log(token);
          localStorage.setItem('token', JSON.stringify(token));
          if (token) {
          this.currentTokenSubject.next(token);
        }
          return token;
        }
      ));
  }
}
