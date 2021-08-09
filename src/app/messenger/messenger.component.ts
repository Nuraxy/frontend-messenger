import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../user/user';
import {FormControl, Validators} from '@angular/forms';
import {WebSocketService} from './websocket.service';
import {Subject} from 'rxjs';
import {Page} from '../page';
import {UserService} from '../user/user.service';
import {Token} from '../token';
import {FriendsService} from '../user/friend.service';
import {ChatMessage, IngoingChatMessage} from './chat-message';
import {LoginService} from '../login/login.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit, OnDestroy {
  friends: User[] = [];
  chatId!: string;

  allChatMessagesIncoming: IngoingChatMessage[] = [];
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
              public loginService: LoginService) {
  }

  ngOnInit(): void {
    this.currentToken = JSON.parse(localStorage.getItem('token') as string);
    const greetingChatMessage: ChatMessage = {
      messageType: 'Greeting',
      senderId: this.currentToken.user.userId,
      message: 'Missing PublicKey'
    };

    if (this.currentToken.user.publicKey != null) {
      greetingChatMessage.message = this.currentToken.user.publicKey;
    }
    this.webSocketService.onOpenWebSocket(greetingChatMessage);
    this.friendService.getUserFriends(this.currentToken.user.userId).subscribe((friends) => this.friends = friends);
  }

  getUnreadMessages( friend: User): number | undefined {
    const chatId = this.webSocketService.createChatId(friend);
    return this.webSocketService.ingoingChatMessagesListOfUnread.get(chatId)?.length;
  }

  getChatId(friendId: number): void {
    this.userService.getUser(friendId).subscribe((user) => {
        this.chatId = this.webSocketService.createChatId(user);
        // this.allChatMessagesIncoming = this.webSocketService.allChatMessagesIncoming.filter((element) => element.chatId === this.chatId);
      }
    );
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
