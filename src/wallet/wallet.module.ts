import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet } from './entity/wallet.entity';
import { WalletBalance } from '../wallet-balance/wallet-balance.entity';
import { Currency } from '../currency/currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletBalance, Currency])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
