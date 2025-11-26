import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Wallet } from './wallet/entity/wallet.entity';
import { Currency } from './currency/currency.entity';
import { WalletBalance } from './wallet-balance/wallet-balance.entity';
import { WalletModule } from './wallet/wallet.module';
import { WalletBalanceModule } from './wallet-balance/wallet-balance.module';
import { TransactionModule } from './transaction/transaction.module';
import { CurrencyModule } from './currency/currency.module';
import { ConversionModule } from './conversion/conversion.module';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // DDL is handled by init.sql
    }),
    WalletModule,
    WalletBalanceModule,
    TransactionModule,
    CurrencyModule,
    ConversionModule,
    TransferModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
