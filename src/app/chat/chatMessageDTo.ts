import {User} from '../user/user';

export class ChatMessageDto {
  name: string;
  to: number;
  messageType: string;
  message: string;
  publicKey?: string | null;

  constructor(user: User, to: number, message: string) {
    this.name = user.name;
    this.to = to;
    this.messageType = 'Message';
    this.message = message;
    this.publicKey = user.publicKey;
  }
}
