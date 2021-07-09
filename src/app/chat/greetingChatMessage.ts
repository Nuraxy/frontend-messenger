import {User} from '../user/user';

export class GreetingChatMessage {
  messageType: string;
  sender: number;
  messageToSender: string;
  receiver: number;
  messageToReceiver: string;

  constructor(user: User) {
    this.messageType = 'Greeting';
    this.sender = user.userId;
    this.messageToSender = '';
    this.receiver = 1;
    if (user.publicKey != null) {
      this.messageToReceiver = user.publicKey;
    }else {
      this.messageToReceiver = 'Missing PublicKey';
    }
  }

}
