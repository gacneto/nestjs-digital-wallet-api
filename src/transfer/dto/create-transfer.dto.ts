import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({ example: '0x456...', description: 'Target wallet address' })
  @IsString()
  @IsNotEmpty()
  targetAddress: string;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 100.0, description: 'Amount to transfer' })
  @IsNumber()
  @Min(0.00000001)
  amount: number;

  @ApiProperty({
    example: 'private_key',
    description: 'Source wallet private key',
  })
  @IsString()
  @IsNotEmpty()
  privateKey: string;
}
