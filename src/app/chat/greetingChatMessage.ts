import {User} from '../user/user';

export class GreetingChatMessage {
  messageType: string;
  sender: number;
  receiver: number;
  message: string;

  constructor(user: User) {
    this.messageType = 'Greeting';
    this.sender = user.userId;
    this.receiver = 1;
    if (user.publicKey != null) {
      this.message = user.publicKey;
    }else {
      this.message = 'Missing PublicKey';
    }
  }

}
