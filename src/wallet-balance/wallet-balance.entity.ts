import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Wallet } from '../wallet/entity/wallet.entity';
import { Currency } from '../currency/currency.entity';

@Entity('SALDO_CARTEIRA')
export class WalletBalance {
  @ApiProperty({ example: 1, description: 'Balance ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '0x123...', description: 'Wallet address' })
  @Column({ name: 'carteira_endereco' })
  walletAddress: string;

  @ApiProperty({ example: 'BTC', description: 'Currency code' })
  @Column({ name: 'moeda_codigo' })
  currencyCode: string;

  @ApiProperty({ example: 100.5, description: 'Balance amount' })
  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  balance: number;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'carteira_endereco' })
  wallet: Wallet;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'moeda_codigo' })
  currency: Currency;
}
