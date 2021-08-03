import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {WebSocketService} from '../websocket.service';
import {NgForm} from '@angular/forms';
import {MessengerComponent} from '../messenger.component';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

//   // @Output()
//   // programCycleChange: EventEmitter<ProgramCycle> = new EventEmitter<ProgramCycle>();

  @Input()
  chatId!: string;

  @Input()
  currentUserId!: number;

  constructor(public webSocketService: WebSocketService, public messengerComponent: MessengerComponent) {
  }

  ngOnInit(): void {
    this.webSocketService.currentChatId = this.chatId;
    console.log('OnInit' + this.chatId);
  }

  ngOnDestroy(): void {
    this.webSocketService.currentChatId = '';
    console.log('OnDestroy' + this.chatId);
  }

  getRightFriendById(chatId: string): number {

    const array = chatId.split('-');
    if (Number(array[0]) === this.currentUserId) {
      return Number(array[1]);
    } else {
      return Number(array[0]);
    }
    // return Number(chatId.substr(0, chatId.indexOf('-')));
  }

  sendMessage(sendForm: NgForm): void {
    this.webSocketService.sendMessage(this.getRightFriendById(this.chatId), sendForm.value.message);
    sendForm.controls.message.reset();
  }


  moveUnreadMessages(): void {
    const chatListOfUnread = this.webSocketService.ingoingChatMessagesListOfUnread.get(this.chatId);
    if (chatListOfUnread != null) {
      chatListOfUnread.forEach((e) => {
        if (this.webSocketService.ingoingChatMessagesList.has(this.chatId)) {
          this.webSocketService.ingoingChatMessagesList.get(this.chatId)?.push(e);
        } else {
          this.webSocketService.ingoingChatMessagesList.set(this.chatId, [e]);
        }
      });
      this.webSocketService.ingoingChatMessagesListOfUnread.delete(this.chatId);
    }
  }
}
