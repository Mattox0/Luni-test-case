import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { FeedResponseDto } from './dto/responses/feed-response.dto';

@Controller('users/:userId')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('series/:seriesId/feed')
  getFeed(
    @Param('userId') userId: string,
    @Param('seriesId') seriesId: string,
  ): FeedResponseDto {

  }
}
