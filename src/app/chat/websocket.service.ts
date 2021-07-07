import {Injectable} from '@angular/core';
import {ChatMessageDto} from './chatMessageDTo';
import {GreetingChatMessage} from './greetingChatMessage';
import {BehaviorSubject, from} from 'rxjs';
import {RsaoaepService} from './rsaoaep.service';
import {UserService} from '../user/user.service';
import {Token} from '../token';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  webSocket?: WebSocket;
  chatMessages: ChatMessageDto[] = [];
  chatMessageDto!: ChatMessageDto;
  token: BehaviorSubject<Token>;
  interval: any;

  constructor(public rsaoaepService: RsaoaepService, public userService: UserService) {
    this.token = new BehaviorSubject<Token>(JSON.parse(localStorage.getItem('token') as string));
  }

  public onOpenWebSocket(greetingChatMessage: GreetingChatMessage): void {
    this.webSocket = new WebSocket('ws://localhost:8079/chat');

    this.webSocket.onopen = (event) => {
      // console.log('Open: ', event);
      this.webSocket?.send(JSON.stringify(greetingChatMessage));
    };

    this.webSocket.onmessage = (event) => {
      const chatMessageDtoEncrypted = JSON.parse(event.data);
      this.rsaoaepService.decryptMessage(chatMessageDtoEncrypted.message).subscribe((decryptedMessage) => {
        this.chatMessageDto = chatMessageDtoEncrypted;
        this.chatMessageDto.message = decryptedMessage;
        this.chatMessages.push(this.chatMessageDto);
      });
    };

    this.webSocket.onclose = (event) => {
      // console.log('Close: ', event);
    };
  }

  public sendMessage(chatMessageDto: ChatMessageDto): void {
    if (this.webSocket) {
      this.userService.getUser(1).subscribe((receiverUser) => {
          if (receiverUser.publicKey !== undefined) {
            from(this.rsaoaepService.encryptMessage(chatMessageDto.message, receiverUser.publicKey))
              .subscribe((data) => {
                chatMessageDto.message = data;
                if (this.webSocket !== undefined) {
                  this.webSocket.send(JSON.stringify(chatMessageDto));
                }
              });
          }
        }
      );
    }
  }

  public closeWebSocket(): void {
    if (this.webSocket) {
      this.webSocket.close();
    }
  }
}
