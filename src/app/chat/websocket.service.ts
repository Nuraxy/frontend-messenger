import {Injectable} from '@angular/core';
import {ChatMessageDto} from './chatMessageDTo';
import {GreetingChatMessage} from './greetingChatMessage';
import {BehaviorSubject, from, Observable, of, throwError, zip} from 'rxjs';
import {RsaoaepService} from './rsaoaep.service';
import {UserService} from '../user/user.service';
import {Token} from '../token';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {User} from '../user/user';
import {ChangeDetection} from '@angular/cli/lib/config/schema';

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
    console.log('This.WebSocket: ', this.webSocket);

    this.webSocket.onopen = (event) => {
      // console.log('Open: ', event);
      this.webSocket?.send(JSON.stringify(greetingChatMessage));
    };

    this.webSocket.onmessage = (event) => {
      const chatMessageDtoEncrypted = JSON.parse(event.data);
      this.rsaoaepService.decryptMessage(chatMessageDtoEncrypted.message).subscribe((decryptedMessage) => {
        this.chatMessageDto = chatMessageDtoEncrypted;
        // todo if receiver
        this.chatMessageDto.messageToReceiver = decryptedMessage;
        // todo else
        // this.chatMessageDto.messageToSender = decryptedMessage;
        this.chatMessages.push(this.chatMessageDto);
      });
    };

    this.webSocket.onclose = (event) => {
      // console.log('Close: ', event);
    };
  }

  public sendMessage(chatMessageDto: ChatMessageDto): void {
    if (this.webSocket) {
      zip(
        of(chatMessageDto),
        this.userService.getUser(1)
      ).pipe(
        mergeMap(([changeMessage, receiver]: [ChatMessageDto, User]) => {
          if (receiver.publicKey !== undefined) {
            return this.rsaoaepService.encryptMessage(changeMessage.messageToReceiver, receiver.publicKey).pipe(
              tap((messageEncrypted: string) => changeMessage.messageToReceiver = messageEncrypted),
              map(() => chatMessageDto)
            );
          } else {
            // Should not executed
            return of(chatMessageDto);
            // return Observable.throw(new Error('Error missing ReceiverPublicKey'));
          }
        }),
        mergeMap((chatMessage: ChatMessageDto) => {
          if (this.token.value.user.publicKey !== undefined) {
            return this.rsaoaepService.encryptMessage(chatMessage.messageToSender, this.token.value.user.publicKey).pipe(
              tap((messageEncrypted: string) => chatMessage.messageToSender = messageEncrypted),
              map(() => chatMessage)
            );
          } else {
            // Should not executed
            return of(chatMessage);
            // return Observable.throw(new Error('Error missing SenderPublicKey'));
          }
        }),
        map( (chatMessage: ChatMessageDto) => {
          if (this.webSocket !== undefined) {
            this.webSocket.send(JSON.stringify(chatMessage));
          }
        })
      ).subscribe();





      // this.userService.getUser(1)
      //   .pipe(
      //     mergeMap((receiver: User) => {
      //       if (receiver.publicKey !== undefined) {
      //         return this.rsaoaepService.encryptMessage(chatMessageDto.messageToReceiver, receiver.publicKey).pipe(
      //           mergeMap((messageEncrypted: string) => {
      //             return chatMessageDto.messageToReceiver = messageEncrypted;
      //           }),
      //           map(() => chatMessageDto)
      //         );
      //       } else {
      //         // Should not executed
      //         return of(chatMessageDto);
      //         // return Observable.throw(new Error('Error missing ReceiverPublicKey'));
      //       }
      //     }),
      //     mergeMap((chatMessage: ChatMessageDto) => {
      //       if (this.token.value.user.publicKey !== undefined) {
      //         return this.rsaoaepService.encryptMessage(chatMessageDto.messageToSender, this.token.value.user.publicKey).pipe(
      //           mergeMap((messageEncrypted: string) => {
      //            return chatMessageDto.messageToSender = messageEncrypted;
      //           }),
      //           map(() => chatMessageDto)
      //         );
      //       } else {
      //         // Should not executed
      //         return of(chatMessageDto);
      //         // return Observable.throw(new Error('Error missing SenderPublicKey'));
      //       }
      //     }),
      //     map( (chatMessage: ChatMessageDto) => {
      //       if (this.webSocket !== undefined) {
      //         this.webSocket.send(JSON.stringify(chatMessage));
      //       }
      //     })
      //   );
    }
  }

  public closeWebSocket(): void {
    if (this.webSocket) {
      this.webSocket.close();
    }
  }
}
