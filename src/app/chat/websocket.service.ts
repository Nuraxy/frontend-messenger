import {Injectable} from '@angular/core';
import {ChatMessageOutgoing} from './chatMessageOutgoing';
import {GreetingChatMessage} from './greetingChatMessage';
import {BehaviorSubject, forkJoin, Observable, zip} from 'rxjs';
import {RsaoaepService} from './rsaoaep.service';
import {UserService} from '../user/user.service';
import {Token} from '../token';
import {map, mergeAll, mergeMap, tap} from 'rxjs/operators';
import {User} from '../user/user';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  webSocket?: WebSocket;
  chatMessages: ChatMessageOutgoing[] = [];
  chatMessageDto!: ChatMessageOutgoing;
  token: BehaviorSubject<Token>;
  interval: any;

  constructor(public rsaoaepService: RsaoaepService, public userService: UserService) {
    this.token = new BehaviorSubject<Token>(JSON.parse(localStorage.getItem('token') as string));
  }

  public onOpenWebSocket(greetingChatMessage: GreetingChatMessage): void {
    this.webSocket = new WebSocket('ws://localhost:8079/chat');
    console.log('This.WebSocket: ', this.webSocket);

    this.webSocket.onopen = (event) => {
      // console.log('Open: ', event);
      this.webSocket?.send(JSON.stringify(greetingChatMessage));
    };

    this.webSocket.onmessage = (event) => {
      const chatMessageDtoEncrypted = JSON.parse(event.data);
      this.rsaoaepService.decryptMessage(chatMessageDtoEncrypted.message).subscribe((decrypted: string) => {
        this.chatMessageDto = chatMessageDtoEncrypted;
        this.chatMessageDto.message = decrypted;
        this.chatMessages.push(this.chatMessageDto);
      });
    };

    this.webSocket.onclose = (event) => {
      // console.log('Close: ', event);
    };
  }

  private createEncryptedMessage(plainText: string, sender: User, receiver: User, chatId: string): Observable<ChatMessageOutgoing> {
    if (receiver.publicKey != null) {
      return this.rsaoaepService.encryptMessage(plainText, receiver.publicKey).pipe(
        map((cipherText) => new ChatMessageOutgoing(sender, receiver, cipherText, chatId))
      );
    } else {
      throw new Error();
    }
  }

  public sendMessage(receiverId: number, plainText: string): void {
    if (this.webSocket) {
      this.userService.getUser(receiverId).pipe(
        mergeMap(receiver => {
          const chatId = this.createChatId(receiver);
          return forkJoin(
            [this.createEncryptedMessage(plainText, this.token.value.user, this.token.value.user, chatId),
            this.createEncryptedMessage(plainText, this.token.value.user, receiver, chatId)]
          );
        }),
        mergeAll(),
        map((chatMessageOutgoing: ChatMessageOutgoing) => {
          if (this.webSocket !== undefined) {
            this.webSocket.send(JSON.stringify(chatMessageOutgoing));
          }
        })
      ).subscribe();
    }
  }

  private createChatId(receiver: User): string {
    if (receiver.userId < this.token.value.user.userId) {
      return receiver.userId + '-' + this.token.value.user.userId;
    } else {
      return this.token.value.user.userId + '-' + receiver.userId;
    }
  }

  public closeWebSocket(): void {
    if (this.webSocket) {
      this.webSocket.close();
    }
  }
}
