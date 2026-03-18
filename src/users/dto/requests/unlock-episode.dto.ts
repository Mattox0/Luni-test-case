import { IsString, IsNotEmpty } from 'class-validator';

export class UnlockEpisodeDto {
  @IsString()
  @IsNotEmpty()
  episodeId: string;
}
