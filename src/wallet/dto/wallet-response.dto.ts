import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
  @ApiProperty({ example: '0x123...', description: 'Wallet address' })
  address: string;

  @ApiProperty({
    example: 'secret_key',
    description: 'Private key (shown only once)',
  })
  privateKey: string;
}
