import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ConversionService } from './conversion.service';
import { ConversionController } from './conversion.controller';
import { Conversion } from './entity/conversion.entity';
import { Wallet } from '../wallet/entity/wallet.entity';
import { WalletBalance } from '../wallet-balance/wallet-balance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversion, Wallet, WalletBalance]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [ConversionController],
  providers: [ConversionService],
})
export class ConversionModule {}
