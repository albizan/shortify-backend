import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { LinkModule } from '../link/link.module';
import { LinkService } from '../link/link.service';
import { Link } from '../link/link.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Link]),
    forwardRef(() => LinkModule),
  ],
  providers: [UserService, LinkService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
