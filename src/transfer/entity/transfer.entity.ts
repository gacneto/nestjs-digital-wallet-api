import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('TRANSFERENCIA')
export class Transfer {
  @ApiProperty({ example: 1, description: 'Transfer ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '0x123...', description: 'Source wallet address' })
  @Column({ name: 'carteira_origem' })
  sourceWallet: string;

  @ApiProperty({ example: '0x456...', description: 'Target wallet address' })
  @Column({ name: 'carteira_destino' })
  targetWallet: string;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  @Column({ name: 'moeda_codigo' })
  currencyCode: string;

  @ApiProperty({ example: 100.0, description: 'Transfer amount' })
  @Column({ name: 'valor', type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @ApiProperty({ example: 1.0, description: 'Transfer fee' })
  @Column({ name: 'taxa', type: 'decimal', precision: 20, scale: 8 })
  fee: number;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Operation date',
  })
  @CreateDateColumn({ name: 'data_operacao' })
  operationDate: Date;
}
