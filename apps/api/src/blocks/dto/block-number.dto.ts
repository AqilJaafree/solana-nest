import { IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class BlockNumberDto {
  @IsNumber({}, { message: 'Block number must be a valid number' })
  @Min(1, { message: 'Block number must be greater than 0' })
  @Max(999999999, { message: 'Block number is too large' })
  @Transform(({ value }) => parseInt(value))
  blockNumber: number;
}
