import { IsString, IsNotEmpty } from 'class-validator';

export class UnlockBatchDto {
  @IsString()
  @IsNotEmpty()
  seriesId: string;
}
