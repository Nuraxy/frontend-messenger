import {User} from '../user/user';

export class ChatMessage {
  name: string;
  to: string;
  message: string;
  keyE: number;
  keyN: number;

  constructor(user: User) {
    this.name = user.name;
    this.to = 'Greeting';
    this.message = 'Empty Greeting Message';
    this.keyE = 17;
    this.keyN = 2773;
  }
}
