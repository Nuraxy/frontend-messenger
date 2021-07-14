import {User} from '../user/user';

export class ChatMessageOutgoing {
  messageType: string;
  sender: number;
  receiver: number;
  chatId: string;
  message: string;

  constructor(sender: User, receiver: User, preEncrypted: string, chatId: string) {
    this.messageType = 'Message';
    this.sender = sender.userId;
    this.receiver = receiver.userId;
    this.chatId = chatId;
    this.message = preEncrypted;
  }
}
