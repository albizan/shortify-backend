import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';

import { RegisterDto } from 'src/auth/dto/register.dto';
import { User } from './user.entity';
import { UserResponseObject } from './ro/user.ro';
import { LinkService } from '../link/link.service';
import { AddLinkDto } from '../link/dto/add-link.dto';
import { LinkResponseObject } from '../link/ro/link.ro';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly linkService: LinkService,
  ) {
    this.logger = new Logger('UserService');
  }
  private logger: Logger;

  // Register function is used to create new users and save them to the database, if new user already exists throw an error
  async register(registerDto: RegisterDto): Promise<UserResponseObject> {
    // Create a new user object based on dto
    const user: User = this.userRepository.create();
    // Populate user object
    const { name, email, password } = registerDto;
    user.name = name;
    user.email = email;
    user.password = password;
    // user is not active untill email is confirmed
    user.isActive = false;

    /* Try saving user to the database, if an error is thrown, check if the error code indicates a conflict */
    try {
      await this.userRepository.save(user);
      // Sanitize user object before return
      return this.sanitizeUser(user);
    } catch (error) {
      if (error.code === '23505') {
        // 23505 is a pg error code indicating a conflict, this comes from User entity unique constraint on email property
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException(
          'Internal Error, user was not saved',
        );
      }
    }
  }

  // findUserByEmail is a function used to retreive a user from the database
  findUserByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ email });
  }

  // findUserById is a function used to retreive a user from the database
  findUserById(id: string): Promise<User> {
    return this.userRepository.findOne(id);
  }

  // Retreive stats for a given user
  async getUserStats(userId: string) {
    try {
      const { links } = await this.userRepository.findOne(userId, {
        relations: ['links'],
      });
      const stats = links.reduce(
        (stats, link) => {
          if (link.isActive) {
            stats.active++;
          }
          stats.clicks += link.clicks;
          return stats;
        },
        {
          active: 0,
          clicks: 0,
        },
      );
      return {
        totalLinks: links.length,
        activeLinks: stats.active,
        totalClicks: stats.clicks,
      };
    } catch (error) {
      this.logger.log(error);
      throw error;
    }
  }

  async getUserLinks(userId, page = 1, size = 5) {
    // Arithmetics to calculate range of links to query
    const from = (page - 1) * size;
    return this.linkService.getLinksWithQueryBuilder(userId, from, size);
  }

  async createLink(
    userId: string,
    AddLinkDto: AddLinkDto,
  ): Promise<LinkResponseObject> {
    try {
      // Retreive user object
      const user = await this.findUserById(userId);
      return await this.linkService.createLink(user, AddLinkDto);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Cannot find user');
    }
  }

  async deleteLink(userId: string, linkId: string) {
    try {
      // Retreive user object
      const user = await this.findUserById(userId);
      return await this.linkService.deleteLink(user, linkId);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Cannot find user');
    }
  }
  async patchLink(linkId: string, partialDto: Partial<AddLinkDto>) {
    try {
      console.log(partialDto);
      return await this.linkService.patchLink(linkId, partialDto);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Cannot find user');
    }
  }

  // activate user
  activateUser(id: string): void {
    this.userRepository.update(id, { isActive: true });
  }
  async changePassword(user, newPassword) {
    user.password = newPassword;
    return this.sanitizeUser(await this.userRepository.save(user));
  }

  sanitizeUser(user: User) {
    return new UserResponseObject(user);
  }
}
