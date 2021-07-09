import {User} from '../user/user';

export class ChatMessageDto {
  messageType: string;
  sender: number;
  messageToSender: string;
  receiver: number;
  messageToReceiver: string;

  constructor(user: User, receiverId: number, preEncrypted: string) {
    this.messageType = 'Message';
    this.sender = user.userId;
    this.messageToSender = preEncrypted;
    this.receiver = receiverId;
    this.messageToReceiver = preEncrypted;
  }
}
