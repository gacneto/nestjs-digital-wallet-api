import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateWithdrawDto {
  @ApiProperty({ example: 'BTC', description: 'Currency code' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 50.0, description: 'Withdrawal amount' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'secret_key', description: 'Wallet private key' })
  @IsString()
  privateKey: string;
}
