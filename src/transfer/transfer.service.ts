import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Transfer } from './entity/transfer.entity';
import { Wallet } from '../wallet/entity/wallet.entity';
import { WalletBalance } from '../wallet-balance/wallet-balance.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletBalance)
    private walletBalanceRepository: Repository<WalletBalance>,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async realizarTransferencia(
    sourceAddress: string,
    createTransferDto: CreateTransferDto,
  ): Promise<Transfer> {
    const { targetAddress, currency, amount, privateKey } = createTransferDto;

    // 1. Validate Source Wallet and Private Key
    const sourceWallet = await this.walletRepository.findOne({
      where: { address: sourceAddress },
    });

    if (!sourceWallet) {
      throw new NotFoundException('Source wallet not found');
    }

    const isKeyValid = await bcrypt.compare(
      privateKey,
      sourceWallet.privateKeyHash,
    );
    if (!isKeyValid) {
      throw new UnauthorizedException('Invalid private key');
    }

    // 2. Validate Target Wallet
    const targetWallet = await this.walletRepository.findOne({
      where: { address: targetAddress },
    });

    if (!targetWallet) {
      throw new NotFoundException('Target wallet not found');
    }

    if (sourceAddress === targetAddress) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    // 3. Calculate Fee and Total Debit
    const fee = parseFloat(
      this.configService.get<string>('TAXA_TRANSFERENCIA') || '0',
    );
    const totalDebit = amount + fee;

    // 4. Check Source Balance
    const sourceBalance = await this.walletBalanceRepository.findOne({
      where: { walletAddress: sourceAddress, currencyCode: currency },
    });

    if (!sourceBalance || Number(sourceBalance.balance) < totalDebit) {
      throw new BadRequestException('Insufficient funds');
    }

    // 5. Atomic Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Debit Source
      await queryRunner.manager.decrement(
        WalletBalance,
        { walletAddress: sourceAddress, currencyCode: currency },
        'balance',
        totalDebit,
      );

      // Credit Target
      // Check if target balance exists
      let targetBalance = await queryRunner.manager.findOne(WalletBalance, {
        where: { walletAddress: targetAddress, currencyCode: currency },
      });

      if (!targetBalance) {
        targetBalance = queryRunner.manager.create(WalletBalance, {
          walletAddress: targetAddress,
          currencyCode: currency,
          balance: 0,
        });
        await queryRunner.manager.save(targetBalance);
      }

      await queryRunner.manager.increment(
        WalletBalance,
        { walletAddress: targetAddress, currencyCode: currency },
        'balance',
        amount,
      );

      // Record Transfer
      const transfer = queryRunner.manager.create(Transfer, {
        sourceWallet: sourceAddress,
        targetWallet: targetAddress,
        currencyCode: currency,
        amount: amount,
        fee: fee,
      });

      await queryRunner.manager.save(transfer);

      await queryRunner.commitTransaction();
      return transfer;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
