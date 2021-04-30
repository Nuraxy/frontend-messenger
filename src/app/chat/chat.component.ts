import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../user/user';
import {NgForm} from '@angular/forms';
import {ChatMessage} from './chatMessage';
import {ChatMessageDto} from './chatMessageDTo';
import {WebSocketService} from './websocket.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  friends: User[] = [{userId: 1, name: 'Niclas'}, {userId: 2, name: 'Marc'}];
  chatId!: number;
  currentUser: User = {userId: 1, name: 'Niclas'};

  constructor( public webSocketService: WebSocketService) {
  }

  ngOnInit(): void {
    const chatMessage = new ChatMessage(this.currentUser);
    this.webSocketService.openWebSocket(chatMessage);
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
