import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Wallet } from '../../wallet/entity/wallet.entity';
import { Currency } from '../../currency/currency.entity';

@Entity('DEPOSITO_SAQUE')
export class Transaction {
  @ApiProperty({ example: 1, description: 'Transaction ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '0x123...', description: 'Wallet address' })
  @Column({ name: 'carteira_endereco' })
  walletAddress: string;

  @ApiProperty({ example: 'BTC', description: 'Currency code' })
  @Column({ name: 'moeda_codigo' })
  currencyCode: string;

  @ApiProperty({ example: 'DEPOSITO', description: 'Transaction type' })
  @Column({ name: 'tipo' })
  type: string;

  @ApiProperty({ example: 100.5, description: 'Transaction amount' })
  @Column({ name: 'valor', type: 'decimal', precision: 20, scale: 8 })
  valor: number;

  @ApiProperty({ example: 0.5, description: 'Transaction fee' })
  @Column({
    name: 'taxa',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
  })
  fee: number;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Transaction date',
  })
  @CreateDateColumn({ name: 'data_operacao' })
  date: Date;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'carteira_endereco' })
  wallet: Wallet;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'moeda_codigo' })
  currency: Currency;
}
