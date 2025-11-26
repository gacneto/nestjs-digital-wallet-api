import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { Conversion } from './entity/conversion.entity';
import { Wallet } from '../wallet/entity/wallet.entity';
import { WalletBalance } from '../wallet-balance/wallet-balance.entity';
import { CreateConversionDto } from './dto/create-conversion.dto';

@Injectable()
export class ConversionService {
  constructor(
    @InjectRepository(Conversion)
    private conversionRepository: Repository<Conversion>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletBalance)
    private walletBalanceRepository: Repository<WalletBalance>,
    private httpService: HttpService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async convert(
    walletAddress: string,
    createConversionDto: CreateConversionDto,
  ): Promise<Conversion> {
    const { sourceCurrency, targetCurrency, amount, privateKey } =
      createConversionDto;

    // 1. Validate Wallet and Private Key
    const wallet = await this.walletRepository.findOne({
      where: { address: walletAddress },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const isKeyValid = await bcrypt.compare(privateKey, wallet.privateKeyHash);
    if (!isKeyValid) {
      throw new UnauthorizedException('Invalid private key');
    }

    // 2. Check Balance
    const sourceBalance = await this.walletBalanceRepository.findOne({
      where: { walletAddress, currencyCode: sourceCurrency },
    });

    if (!sourceBalance || Number(sourceBalance.balance) < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    // 3. Get Conversion Rate
    let rate = 0;
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.coinbase.com/v2/prices/${sourceCurrency}-${targetCurrency}/spot`,
        ),
      );
      rate = parseFloat(response.data.data.amount);
    } catch (error) {
      throw new BadRequestException('Failed to fetch conversion rate');
    }

    // 4. Calculate Amounts
    const feePercentage = parseFloat(
      this.configService.get<string>('TAXA_CONVERSAO_PERCENTUAL') || '0',
    );

    // Logic: Debit source amount. Credit target amount = (source * rate) * (1 - fee)
    // Wait, the prompt says: "sugestão: debite valor_origem da carteira e credite valor_convertido * (1 - taxa) no destino"
    // So the fee is deducted from the converted amount.

    const rawConvertedAmount = amount * rate;
    const feeAmount = rawConvertedAmount * feePercentage;
    const finalTargetAmount = rawConvertedAmount - feeAmount;

    // 5. Atomic Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Debit Source
      await queryRunner.manager.decrement(
        WalletBalance,
        { walletAddress, currencyCode: sourceCurrency },
        'balance',
        amount,
      );

      // Credit Target
      // Check if target balance exists (it should if wallet created correctly, but let's be safe)
      let targetBalance = await queryRunner.manager.findOne(WalletBalance, {
        where: { walletAddress, currencyCode: targetCurrency },
      });

      if (!targetBalance) {
        // Should have been created on wallet creation, but handle if missing
        targetBalance = queryRunner.manager.create(WalletBalance, {
          walletAddress,
          currencyCode: targetCurrency,
          balance: 0,
        });
        await queryRunner.manager.save(targetBalance);
      }

      await queryRunner.manager.increment(
        WalletBalance,
        { walletAddress, currencyCode: targetCurrency },
        'balance',
        finalTargetAmount,
      );

      // Record Conversion
      const conversion = queryRunner.manager.create(Conversion, {
        walletAddress,
        sourceCurrency,
        targetCurrency,
        sourceAmount: amount,
        targetAmount: finalTargetAmount,
        fee: feeAmount,
      });

      await queryRunner.manager.save(conversion);

      await queryRunner.commitTransaction();
      return conversion;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
