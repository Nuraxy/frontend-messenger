import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {LoginService} from '../login/login.service';
import {Observable} from 'rxjs';
import {User} from './user';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  constructor(
    private http: HttpClient,
    private loginService: LoginService
  ) { }

  searchFriends(term: string, userId: number): Observable<User[]> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('name', term.trim());
    return this.http.get<User[]>(`${environment.apiUrl}users/friends/${userId}`, {params: httpParams});
  }

  getUserFriends(userId: number): Observable<User[]> {
    const httpParams = new HttpParams();
    return this.http.get<User[]>(`${environment.apiUrl}users/friends/${userId}`, {params: httpParams});
  }

  addFriend(id?: number): Observable<User> {
    const httpParams = new HttpParams();
    const friendId = id;
    const userId = this.loginService.currentTokenValue.user.userId;
    const user = undefined;
    return this.http.post<User>(`${environment.apiUrl}users/friends/${userId}/${friendId}`, user, {params: httpParams});
  }

  removeFriend(friendId: number, userId: number): Observable<any> {
    const httpParams = new HttpParams();
    return this.http.delete<any>(`${environment.apiUrl}users/friends/${userId}/${friendId}`, {params: httpParams});
  }

  getFriendRequestByUserId(): Observable<User[]> {
    const userId = this.loginService.currentTokenValue.user.userId;
    const httpParams = new HttpParams();
    return this.http.get<User[]>(`${environment.apiUrl}users/friendRequest/${userId}`, {params: httpParams});
  }

  getRequestedFriendsByUserId(userId: number): Observable<User[]> {
    const httpParams = new HttpParams();
    return this.http.get<User[]>(`${environment.apiUrl}users/requestedFriends/${userId}`, {params: httpParams});
  }

  confirmFriendsByUserIdAndFriendId(userId: number, friendId: number, confirm: boolean): Observable<User[]> {
    const httpParams = new HttpParams();
    const user = undefined;
    return this.http.put<User[]>(`${environment.apiUrl}users/friends/${userId}/${friendId}/${confirm}`, user, {params: httpParams});
  }
}
