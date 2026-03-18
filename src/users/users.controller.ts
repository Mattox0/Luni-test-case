import { Controller, Get, Param } from '@nestjs/common';
import { SeriesService } from '../series/services/series.service';
import { FeedResponseDto } from './dto/responses/feed-response.dto';

@Controller('users/:userId')
export class UsersController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get('series/:seriesId/feed')
  getFeed(
    @Param('userId') userId: string,
    @Param('seriesId') seriesId: string,
  ): FeedResponseDto {
    return this.seriesService.getFeed(userId, seriesId);
  }
}
