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
  readFlag: boolean;
}
// export class ChatMessageIncoming {
//   messageId!: number;
//   messageType!: string;
//   senderId!: number;
//   receiverId!: number;
//   chatId!: string;
//   message!: string;
//   read!: boolean;
//
// }

export interface MarkAsReadMassage extends ChatMessage {
  chatId: string;
}
