import {Component, Input, OnInit} from '@angular/core';
import {WebSocketService} from '../websocket.service';
import {NgForm} from '@angular/forms';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

//   // @Output()
//   // programCycleChange: EventEmitter<ProgramCycle> = new EventEmitter<ProgramCycle>();

  @Input()
  chatId!: string;

  @Input()
  currentUserId!: number;

  constructor(public webSocketService: WebSocketService) {
  }

  ngOnInit(): void {
    // getChatById
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
}
