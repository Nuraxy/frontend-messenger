import {User} from '../user/user';

export class GreetingChatMessage {
  name: string;
  to: number;
  messageType: string;
  message: string;
  publicKey?: string | null;

  constructor(user: User) {
    this.name = user.name;
    this.to = 1;
    this.messageType = 'Greeting';
    this.message = 'Empty Greeting Message';
    this.publicKey = user.publicKey;
  }
}
