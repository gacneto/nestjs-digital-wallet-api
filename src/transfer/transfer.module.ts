import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { Transfer } from './entity/transfer.entity';
import { Wallet } from '../wallet/entity/wallet.entity';
import { WalletBalance } from '../wallet-balance/wallet-balance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer, Wallet, WalletBalance]),
    ConfigModule,
  ],
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransferModule {}
