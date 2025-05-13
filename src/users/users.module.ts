import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
// Import UsersController if you have one and need it
// import { UsersController } from './users.controller';

@Module({
  // controllers: [UsersController], // Uncomment if needed
  providers: [UsersService],
  exports: [UsersService], // Export UsersService so AuthModule can use it
})
export class UsersModule {}
