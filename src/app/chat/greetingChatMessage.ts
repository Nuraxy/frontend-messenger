import {User} from '../user/user';

export class GreetingChatMessage {
  name: string;
  to: number;
  messageType: string;
  message: string;

  constructor(user: User) {
    this.name = user.name;
    this.to = 1;
    this.messageType = 'Greeting';
    if (user.publicKey != null) {
      this.message = user.publicKey;
    }else {
      this.message = 'Missing PublicKey';
    }
  }

}
