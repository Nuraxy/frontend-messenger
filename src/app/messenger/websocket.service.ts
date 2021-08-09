import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable} from 'rxjs';
import {RsaoaepService} from './rsaoaep.service';
import {UserService} from '../user/user.service';
import {Token} from '../token';
import {map, mergeAll, mergeMap} from 'rxjs/operators';
import {User} from '../user/user';
import {ChatMessage, IngoingChatMessage, OutgoingChatMassage} from './chat-message';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  webSocket?: WebSocket;
  ingoingChatMessagesList = new Map<string, IngoingChatMessage[]>();
  ingoingOldChatMessagesList = new Map<string, IngoingChatMessage[]>();
  ingoingChatMessagesListOfUnread = new Map<string, IngoingChatMessage[]>();
  currentChatId = '';
  chatMessageIncoming!: IngoingChatMessage;
  token: BehaviorSubject<Token>;
  interval: any;

  constructor(public rsaoaepService: RsaoaepService, public userService: UserService) {
    this.token = new BehaviorSubject<Token>(JSON.parse(localStorage.getItem('token') as string));
  }

  public onOpenWebSocket(greetingChatMessage: ChatMessage): void {
    this.webSocket = new WebSocket('ws://localhost:8079/chat');
    console.log('This.WebSocket: ', this.webSocket);

    this.webSocket.onopen = (event) => {
      this.webSocket?.send(JSON.stringify(greetingChatMessage));
    };

    this.webSocket.onmessage = (event) => {
      const chatMessageDtoIncoming = JSON.parse(event.data);
      this.rsaoaepService.decryptMessage(chatMessageDtoIncoming.message).subscribe((decrypted: string) => {
        this.chatMessageIncoming = chatMessageDtoIncoming;
        this.chatMessageIncoming.message = decrypted;
        if (this.chatMessageIncoming.messageType === 'Message') {
        const chatListOfUnread = this.ingoingChatMessagesListOfUnread.get(chatMessageDtoIncoming.chatId);
        // chatListOfUnread.push(chatMessageDtoIncoming);
        if (this.currentChatId === chatMessageDtoIncoming.chatId) {
          if (chatListOfUnread != null) {
            if (chatListOfUnread.length > 0) {
              this.ingoingChatMessagesListOfUnread.get(chatMessageDtoIncoming.chatId)?.push(chatMessageDtoIncoming);
            } else {
              this.saveInCurrentList(chatMessageDtoIncoming);
            }
          } else {
            this.saveInCurrentList(chatMessageDtoIncoming);
          }
        } else {
          if (this.ingoingChatMessagesListOfUnread.has(chatMessageDtoIncoming.chatId)) {
            this.ingoingChatMessagesListOfUnread.get(chatMessageDtoIncoming.chatId)?.push(chatMessageDtoIncoming);
          } else {
            this.ingoingChatMessagesListOfUnread.set(chatMessageDtoIncoming.chatId, [chatMessageDtoIncoming]);
          }
        }
        } else if (this.chatMessageIncoming.messageType === 'OldMessage') {
          console.log('läuft');
        }
      });
    };
    this.webSocket.onclose = (event) => {
    };
  }

  private saveInCurrentList(chatMessageDtoIncoming: any): void {
    if (this.ingoingChatMessagesList.has(chatMessageDtoIncoming.chatId)) {
      this.ingoingChatMessagesList.get(chatMessageDtoIncoming.chatId)?.push(chatMessageDtoIncoming);
    } else {
      this.ingoingChatMessagesList.set(chatMessageDtoIncoming.chatId, [chatMessageDtoIncoming]);
    }
  }

  private createEncryptedMessage(plainText: string, sender: User, receiver: User, chatId: string): Observable<OutgoingChatMassage> {
    let outgoingChatMassage: OutgoingChatMassage;
    if (receiver.publicKey != null) {
      return this.rsaoaepService.encryptMessage(plainText, receiver.publicKey).pipe(
        map((cipherText) => {
          return outgoingChatMassage = {
            messageType: 'Message',
            senderId: sender.userId,
            message: cipherText,
            receiverId: receiver.userId,
            chatId
          };
        })
      );
    } else {
      console.log('PublicKey form message receiver: ' + receiver.publicKey);
      throw new Error('error missing publicKey');
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
          ).pipe(
            map((chatMessagesToSend) => {
              // todo früher abfragen ?
              if (chatMessagesToSend[1].senderId === chatMessagesToSend[1].receiverId) {
                return chatMessagesToSend.slice(0, 1);
              }
              return chatMessagesToSend;
            })
          );
        }),
        mergeAll(),
        map((chatMessageOutgoing: OutgoingChatMassage) => {
          if (this.webSocket !== undefined) {
            this.webSocket.send(JSON.stringify(chatMessageOutgoing));
          }
        })
      ).subscribe();
    }
  }

  public withSpecialMessageType(withSpecialMessageType: ChatMessage): void {
    this.webSocket?.send(JSON.stringify(withSpecialMessageType));
  }

  public createChatId(receiver: User): string {
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
