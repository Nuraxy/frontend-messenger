import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../user/user';
import {FormControl, NgForm, Validators} from '@angular/forms';
import {GreetingChatMessage} from './greetingChatMessage';
import {ChatMessageDto} from './chatMessageDTo';
import {WebSocketService} from './websocket.service';
import {LoginService} from '../login/login.service';
import {Subject} from 'rxjs';
import {Page} from '../page';
import {UserService} from '../user/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  friends: User[] = [{userId: 1, name: 'Test', confirmed: true, userRole: {roleId: 1, roleName: 'Admin'}}, {userId: 2, name: 'Test2', confirmed: true, userRole: {roleId: 1, roleName: 'Admin'}}];
  chatId!: number;

  users: User[] = [];
  user = new FormControl(undefined, [Validators.required]);
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
              public loginService: LoginService,
              private userService: UserService) {
  }

  ngOnInit(): void {
    const currentToken = JSON.parse(localStorage.getItem('token') as string);
    console.log('currentUserXOXO', currentToken.user);
    const greetingChatMessage = new GreetingChatMessage(currentToken.user);
    this.webSocketService.onOpenWebSocket(greetingChatMessage);
  }

  getRightFriendById(chatId: number): number {
    for (const friend of this.friends) {
      if (chatId === friend.userId) {
        return friend.userId;
      }
    }
    // todo return for marc
    return 1;
  }

  sendMessage(sendForm: NgForm): void {
    const chatMessageDto = new ChatMessageDto(
      this.loginService.currentTokenValue.user,
      this.getRightFriendById(this.chatId),
      sendForm.value.message);

    this.webSocketService.sendMessage(chatMessageDto);
    sendForm.controls.message.reset();
  }

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
