import { User } from '../user.entity';

export class UserResponseObject {
  constructor(user: User) {
    const { id, name, email } = user;
    this.id = id;
    this.name = name;
    this.email = email;
  }
  id: string;
  name: string;
  email: string;
}
