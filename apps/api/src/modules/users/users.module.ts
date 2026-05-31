import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [ProfileController, UsersController],
  providers: [UsersService],
})
export class UsersModule {}
