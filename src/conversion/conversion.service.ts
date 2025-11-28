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

    const sourceBalance = await this.walletBalanceRepository.findOne({
      where: { walletAddress, currencyCode: sourceCurrency },
    });

    if (!sourceBalance || Number(sourceBalance.balance) < amount) {
      throw new BadRequestException('Insufficient funds');
    }

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

    const feePercentage = parseFloat(
      this.configService.get<string>('TAXA_CONVERSAO_PERCENTUAL') || '0',
    );

    const rawConvertedAmount = amount * rate;
    const feeAmount = rawConvertedAmount * feePercentage;
    const finalTargetAmount = rawConvertedAmount - feeAmount;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.decrement(
        WalletBalance,
        { walletAddress, currencyCode: sourceCurrency },
        'balance',
        amount,
      );

      let targetBalance = await queryRunner.manager.findOne(WalletBalance, {
        where: { walletAddress, currencyCode: targetCurrency },
      });

      if (!targetBalance) {
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
