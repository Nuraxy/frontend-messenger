import {User} from '../user/user';

export interface ChatMessage {
  messageType: string;
  senderId: number;
  message: string;
}

export interface OutgoingChatMassage extends ChatMessage {
  receiverId: number;
  chatId: string;
}

export interface IngoingChatMessage extends OutgoingChatMassage {
  messageId: number;
}

export interface MarkAsReadMassage extends ChatMessage {
  chatId: string;
}
