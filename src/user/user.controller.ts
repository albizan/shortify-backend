import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
  Post,
  Body,
  ValidationPipe,
  Delete,
  Param,
  Patch,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AddLinkDto } from '../link/dto/add-link.dto';
import { GetUserId } from './get-user.decorator';
import { UserService } from './user.service';
import { UserResponseObject } from './ro/user.ro';
import { LinkResponseObject } from '../link/ro/link.ro';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {
    this.logger = new Logger('UserController');
  }
  private logger: Logger;

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getPersonalInfo(
    @GetUserId() userId: string,
  ): Promise<UserResponseObject> {
    const user = await this.userService.findUserById(userId);
    return this.userService.sanitizeUser(user);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getUserStats(@GetUserId() userId: string) {
    return this.userService.getUserStats(userId);
  }

  @Get('links')
  @UseGuards(AuthGuard('jwt'))
  getUserLinks(
    @GetUserId() userId: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number,
  ) {
    return this.userService.getUserLinks(userId, page, size);
  }

  @Post('add-link')
  @UseGuards(AuthGuard('jwt'))
  async createLink(
    @Body(ValidationPipe) addLinkDto: AddLinkDto,
    @GetUserId() userId: string,
  ): Promise<LinkResponseObject> {
    return this.userService.createLink(userId, addLinkDto);
  }

  @Delete('delete-link/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteLink(@Param() params, @GetUserId() userId: string) {
    return this.userService.deleteLink(userId, params.id);
  }

  @Patch('patch-link/:id')
  @UseGuards(AuthGuard('jwt'))
  async patchLink(
    @Param() params,
    @Body() partialDto: Partial<AddLinkDto>,
    @GetUserId() userId: string,
  ) {
    return this.userService.patchLink(params.id, partialDto);
  }
}
