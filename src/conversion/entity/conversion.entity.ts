import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Wallet } from '../../wallet/entity/wallet.entity';
import { Currency } from '../../currency/currency.entity';

@Entity('CONVERSAO')
export class Conversion {
  @ApiProperty({ example: 1, description: 'Conversion ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '0x123...', description: 'Wallet address' })
  @Column({ name: 'carteira_endereco' })
  walletAddress: string;

  @ApiProperty({ example: 'USD', description: 'Source currency' })
  @Column({ name: 'moeda_origem' })
  sourceCurrency: string;

  @ApiProperty({ example: 'BTC', description: 'Target currency' })
  @Column({ name: 'moeda_destino' })
  targetCurrency: string;

  @ApiProperty({ example: 100.0, description: 'Source amount' })
  @Column({ name: 'valor_origem', type: 'decimal', precision: 20, scale: 8 })
  sourceAmount: number;

  @ApiProperty({ example: 0.002, description: 'Target amount' })
  @Column({ name: 'valor_destino', type: 'decimal', precision: 20, scale: 8 })
  targetAmount: number;

  @ApiProperty({ example: 0.01, description: 'Conversion fee' })
  @Column({ name: 'taxa', type: 'decimal', precision: 20, scale: 8 })
  fee: number;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Operation date',
  })
  @CreateDateColumn({ name: 'data_operacao' })
  operationDate: Date;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'carteira_endereco' })
  wallet: Wallet;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'moeda_origem' })
  sourceCurrencyEntity: Currency;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'moeda_destino' })
  targetCurrencyEntity: Currency;
}
