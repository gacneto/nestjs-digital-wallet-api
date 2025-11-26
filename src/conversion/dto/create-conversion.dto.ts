import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateConversionDto {
  @ApiProperty({ example: 'USD', description: 'Source currency code' })
  @IsString()
  @IsNotEmpty()
  sourceCurrency: string;

  @ApiProperty({ example: 'BTC', description: 'Target currency code' })
  @IsString()
  @IsNotEmpty()
  targetCurrency: string;

  @ApiProperty({ example: 100.0, description: 'Amount to convert' })
  @IsNumber()
  @Min(0.00000001)
  amount: number;

  @ApiProperty({ example: 'private_key', description: 'Wallet private key' })
  @IsString()
  @IsNotEmpty()
  privateKey: string;
}
