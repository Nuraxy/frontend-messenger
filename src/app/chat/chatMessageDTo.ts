import {User} from '../user';

export class ChatMessageDto {
  name: string;
  to: string;
  message: string;

  constructor(user: User, to: string, message: string) {
    this.name = user.name;
    this.to = to;
    this.message = message;
  }
}
