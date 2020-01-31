import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import nanoid from 'nanoid';

import { Link } from './link.entity';
import { Repository } from 'typeorm';
import { AddLinkDto } from './dto/add-link.dto';
import { User } from '../user/user.entity';
import { LinkResponseObject } from './ro/link.ro';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
  ) {
    this.logger = new Logger('LinkService');
  }
  private logger: Logger;

  async getOriginalLink(id: string) {
    try {
      const link: Link = await this.linkRepository.findOne(id);
      link.clicks++;
      this.linkRepository.save(link);
      if (!link.isActive) {
        throw new NotFoundException('Link cannot be found');
      }
      return {
        original: link.original,
      };
    } catch (error) {
      throw new NotFoundException('Link cannot be found');
    }
  }

  async createLink(
    user: User,
    addLinkDto: AddLinkDto,
  ): Promise<LinkResponseObject> {
    const { title, original, isActive } = addLinkDto;
    const link = this.linkRepository.create();
    // generate a random id with 11 characters
    link.id = nanoid(11);
    link.title = title;
    link.original = original;
    link.isActive = isActive;
    link.user = user;

    try {
      await this.linkRepository.save(link);
      return new LinkResponseObject(link);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Cannot save new link');
    }
  }

  async deleteLink(user: User, linkId: string) {
    try {
      const deleted = await this.linkRepository.delete(linkId);
      return deleted;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Cannot delete link');
    }
  }
  async patchLink(linkId: string, partialDto) {
    try {
      const link = await this.linkRepository.preload({
        id: linkId,
        ...partialDto,
      });
      this.linkRepository.save(link);
      // await this.linkRepository.save(link);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Cannot delete link');
    }
  }

  async getLinksWithQueryBuilder(
    userId: string,
    from: number,
    pageSize: number,
  ) {
    try {
      const links = await this.linkRepository
        .createQueryBuilder('link')
        .where('link."userId" = :userId', { userId })
        .orderBy('link."createdAt"', 'DESC')
        .skip(from)
        .take(pageSize)
        .getMany();

      return links;
    } catch (error) {
      this.logger.log({ error });
    }
  }
}
