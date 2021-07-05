import {UserRole} from './userRole';

export class User {
  userId!: number;
  name!: string;
  password?: string;
  email?: string;
  publicKey?: string;
  registerKey?: string;
  confirmed!: boolean;
  newEmail?: string;
  confirmedNewEmail?: boolean;
  userRole!: UserRole;
}
