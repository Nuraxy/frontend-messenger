import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../user/user';
import {FormControl, NgForm, Validators} from '@angular/forms';
import {GreetingChatMessage} from './greetingChatMessage';
import {WebSocketService} from './websocket.service';
import {Subject} from 'rxjs';
import {Page} from '../page';
import {UserService} from '../user/user.service';
import {Token} from '../token';
import {Router} from '@angular/router';
import {FriendsService} from '../user/friend.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit, OnDestroy {
  friends: User[] = [];
  chatId!: number;
  chatId2!: string;

  users: User[] = [];
  user = new FormControl(undefined, [Validators.required]);
  currentToken!: Token;
  searchSubject$: Subject<string> = new Subject<string>();
  loading!: false;
  pageSize = 8;
  pageNumber = 0;
  private hasLoadAllUsers = false;
  private pageUsers!: Page<User>;
  private pageSort!: '';
  private search!: '';
  private pageTotalElements!: number;

  constructor(public webSocketService: WebSocketService,
              private userService: UserService,
              private friendService: FriendsService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.currentToken = JSON.parse(localStorage.getItem('token') as string);
    const greetingChatMessage = new GreetingChatMessage(this.currentToken.user);
    this.webSocketService.onOpenWebSocket(greetingChatMessage);
    this.friendService.getUserFriends(this.currentToken.user.userId).subscribe((friends) => this.friends = friends);
  }

  getChatId(friendId: number): number {
      this.userService.getUser(friendId).subscribe((user) => {
          this.chatId2 = this.webSocketService.createChatId(user);
        }
      );
      // todo return for marc
      return 1;
    }

  // sendMessage(sendForm: NgForm): void {
  //   this.webSocketService.sendMessage(this.getChatId(this.chatId), sendForm.value.message);
  //   sendForm.controls.message.reset();
  // }

  ngOnDestroy(): void {
    this.webSocketService.closeWebSocket();
  }

  onScrollToEnd(): void {
    if (!this.hasLoadAllUsers) {
      this.fetchMore();
    }
  }

  onScroll({end}: any): void {
    if (this.hasLoadAllUsers || this.loading || this.users.length <= this.pageTotalElements) {
      return;
    }

    if (end + this.pageSize >= this.pageUsers.totalPages) {
      this.fetchMore();
    }
  }

  private fetchMore(): void {
    this.pageNumber += 1;
    this.userService.getUserPageableAndSearch(
      this.pageNumber,
      this.pageSize,
      this.pageSort,
      this.search).subscribe(page => {
      this.pageTotalElements = page.totalElements;
      this.users = [...this.users, ...page.content];
      this.hasLoadAllUsers = page.last;
    });
  }

}
