import { Injectable } from '@angular/core';
import {ChatMessageDto} from './chatMessageDTo';
import {ChatMessage} from './chatMessage';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  webSocket?: WebSocket;
  chatMessages: ChatMessageDto[] = [];

  constructor() { }

  public openWebSocket(chatMessageGreeting: ChatMessage): void{
    this.webSocket = new WebSocket('ws://localhost:8080/chat');

    this.webSocket.onopen = (event) => {
      console.log('Open: ', event);
      this.webSocket?.send(JSON.stringify(chatMessageGreeting));
    };

    this.webSocket.onmessage = (event) => {
      const chatMessageDto = JSON.parse(event.data);
      this.chatMessages.push(chatMessageDto);
    };

    this.webSocket.onclose = (event) => {
      console.log('Close: ', event);
    };
  }

  public sendMessage(chatMessageDto: ChatMessageDto): void {
    if (this.webSocket) {
      this.webSocket.send(JSON.stringify(chatMessageDto));
    }
  }

  public closeWebSocket(): void {
    if (this.webSocket){
      this.webSocket.close();
    }
  }
}
