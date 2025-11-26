import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateDepositDto {
  @ApiProperty({ example: 'BTC', description: 'Currency code' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 100.0, description: 'Deposit amount' })
  @IsNumber()
  @IsPositive()
  amount: number;
}
