import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from './user';
import {environment} from '../../environments/environment';
import {LoginService} from '../login/login.service';
import {Page} from '../page';

@Injectable({providedIn: 'root'})
export class UserService {

  constructor(
    private http: HttpClient,
    private loginService: LoginService
  ) {
  }

  getUser(userId?: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}users/${userId}`);
  }

  getUserByKey(urlKey: string): Observable<User> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('key', urlKey);
    return this.http.get<User>(`${environment.apiUrl}users/verify`, {params: httpParams});
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}users/public`);
  }

  getAllUsers(): Observable<User[]> {
    const authentication = this.loginService.currentTokenValue.tokenValue;
    let httpParams = new HttpParams();
    httpParams = httpParams.append('Authentication', authentication);
    return this.http.get<User[]>(`${environment.apiUrl}users`, {params: httpParams});
  }

  searchPublicUsers(term: string): Observable<User[]> {
    let httpParams = new HttpParams();
    const authentication = this.loginService.currentTokenValue.tokenValue;
    httpParams = httpParams.append('name', term.trim());
    httpParams = httpParams.append('Authentication', authentication);
    return this.http.get<User[]>(`${environment.apiUrl}users/public`, {params: httpParams});
  }

  searchAllUsers(term: string): Observable<User[]> {
    let httpParams = new HttpParams();
    const authentication = this.loginService.currentTokenValue.tokenValue;
    httpParams = httpParams.append('name', term.trim());
    httpParams = httpParams.append('Authentication', authentication);
    return this.http.get<User[]>(`${environment.apiUrl}users`, {params: httpParams});
  }

  setNewPassword(password: string, newPassword: string, userId: number): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}users/password/${userId}`, {password, newPassword});
  }

  updateUser(user: User, userId: number): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}users/${userId}`, {user});
  }

  sendPasswordReset(email: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}users/forgotPassword`, {email});
  }

  getUserPageableAndSearch(
    pageNumber: number,
    pageSize: number,
    pageSort: string,
    search: string = ''): Observable<Page<User>> {

    let params = new HttpParams();

    if (pageNumber != null) {
      params = params.append('page', String(pageNumber));
    }
    if (pageSize != null) {
      params = params.append('size', String(pageSize));
    }
    if (pageSort != null) {
      params = params.append('sort', String(pageSort));
    }
    if (search != null && search.length > 0){
      params = params.append('search', search);
    }

    return this.http.get<Page<User>>(`${environment.apiUrl}/users/search-pageable-users`, {params});
  }
}
