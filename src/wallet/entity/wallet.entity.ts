import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('CARTEIRA')
export class Wallet {
  @ApiProperty({ example: '0x123...', description: 'Wallet address' })
  @PrimaryColumn({ name: 'endereco' })
  address: string;

  @ApiProperty({ example: 'hash...', description: 'Private key hash' })
  @Column({ name: 'hash_chave_privada' })
  privateKeyHash: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Creation date',
  })
  @CreateDateColumn({ name: 'data_criacao' })
  createdAt: Date;

  @ApiProperty({ example: 'active', description: 'Wallet status' })
  @Column({ name: 'status', default: 'active' })
  status: string;
}
