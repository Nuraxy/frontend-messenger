import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../user/user';
import {NgForm} from '@angular/forms';
import {GreetingChatMessage} from './greetingChatMessage';
import {ChatMessageDto} from './chatMessageDTo';
import {WebSocketService} from './websocket.service';
import {LoginService} from '../login/login.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  friends: User[] = [{userId: 1, name: 'Test'}, {userId: 2, name: 'Test2'}];
  chatId!: number;
  currentUser = new User();

  constructor(public webSocketService: WebSocketService, public loginService: LoginService) {
  }

  ngOnInit(): void {
    this.currentUser = this.loginService.currentTokenValue.user;
    const greetingChatMessage = new GreetingChatMessage(this.currentUser);
    this.webSocketService.onOpenWebSocket(greetingChatMessage);
  }

  getRightFriendById(chatId: number): string {
    for (const friend of this.friends) {
      if (chatId === friend.userId) {
        return friend.name;
      }
    }
    return ' ';
  }

  sendMessage(sendForm: NgForm): void {
    const chatMessageDto = new ChatMessageDto(this.currentUser, this.getRightFriendById(this.chatId), sendForm.value.message);
    this.webSocketService.sendMessage(chatMessageDto);
    sendForm.controls.message.reset();
  }

  ngOnDestroy(): void {
    this.webSocketService.closeWebSocket();
  }
}
