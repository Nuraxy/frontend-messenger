import {User} from '../user/user';

export class GreetingChatMessage {
  name: string;
  to: string;
  message: string;
  publicKey?: string | null;

  constructor(user: User) {
    this.name = user.name;
    this.to = 'Greeting';
    this.message = 'Empty Greeting Message';
    this.publicKey = localStorage.getItem('publicKey') as string;
  }
}
