import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SeriesService } from '../series/services/series.service';
import { FeedResponseDto } from './dto/responses/feed-response.dto';
import { UsersService } from './services/users.service';
import { UnlockEpisodeDto } from './dto/requests/unlock-episode.dto';

@Controller('users/:userId')
export class UsersController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly usersService: UsersService,
  ) {}

  @Get('series/:seriesId/feed')
  getFeed(
    @Param('userId') userId: string,
    @Param('seriesId') seriesId: string,
  ): FeedResponseDto {
    return this.seriesService.getFeed(userId, seriesId);
  }

  @Post('unlock')
  unlockEpisode(
    @Param('userId') userId: string,
    @Body() body: UnlockEpisodeDto,
  ) {
    return this.usersService.unlockEpisode(userId, body.episodeId);
  }
}
