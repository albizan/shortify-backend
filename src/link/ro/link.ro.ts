import { Link } from '../link.entity';
import { UserResponseObject } from '../../user/ro/user.ro';

export class LinkResponseObject {
  constructor(link: Link) {
    const { id, title, original, clicks, isActive, createdAt, user } = link;
    this.id = id;
    this.title = title;
    this.original = original;
    this.clicks = clicks;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.user = new UserResponseObject(user);
  }
  id: string;
  title: string;
  original: string;
  clicks: number;
  isActive: boolean;
  createdAt: Date;
  user: UserResponseObject;
}
