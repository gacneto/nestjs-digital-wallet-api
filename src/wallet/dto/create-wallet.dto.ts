import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletDto {
  @ApiProperty({ example: 'address' })
  address?: string;

  @ApiProperty({ example: 'secret_key' })
  privateKey?: string;
}
