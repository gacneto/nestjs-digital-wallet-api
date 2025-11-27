import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Transaction } from './entity/transaction.entity';
import { Wallet } from '../wallet/entity/wallet.entity';
import { WalletBalance } from '../wallet-balance/wallet-balance.entity';
import { Currency } from '../currency/currency.entity';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletBalance)
    private walletBalanceRepository: Repository<WalletBalance>,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async realizarDeposito(address: string, createDepositDto: CreateDepositDto) {
    const { currency: currencyCode, amount } = createDepositDto;

    const wallet = await this.walletRepository.findOne({ where: { address } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const currency = await this.currencyRepository.findOne({
      where: { code: currencyCode },
    });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let balance = await queryRunner.manager.findOne(WalletBalance, {
        where: { walletAddress: address, currencyCode },
      });

      if (!balance) {
        // Should have been created on wallet creation, but just in case
        balance = queryRunner.manager.create(WalletBalance, {
          walletAddress: address,
          currencyCode,
          balance: 0,
        });
      }

      // Update balance
      balance.balance = Number(balance.balance) + Number(amount);
      await queryRunner.manager.save(balance);

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        walletAddress: address,
        currencyCode,
        type: 'DEPOSITO',
        valor: amount,
        fee: 0,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return { message: 'Deposit successful', balance: balance.balance };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async realizarSaque(address: string, createWithdrawDto: CreateWithdrawDto) {
    const { currency: currencyCode, amount, privateKey } = createWithdrawDto;

    const wallet = await this.walletRepository.findOne({ where: { address } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Validate private key
    // Normalize input: remove whitespace and convert to lowercase (as hashes are usually from lowercase hex)
    const normalizedKey = privateKey.trim().toLowerCase();
    const isKeyValid = await bcrypt.compare(
      normalizedKey,
      wallet.privateKeyHash,
    );
    if (!isKeyValid) {
      console.log(
        `Withdrawal failed: Invalid private key for wallet ${address}`,
      );
      throw new UnauthorizedException('Invalid private key');
    }

    const currency = await this.currencyRepository.findOne({
      where: { code: currencyCode },
    });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    const feePercent =
      this.configService.get<number>('TAXA_SAQUE_PERCENTUAL') || 0;
    const fee = Number(amount) * Number(feePercent);
    const totalDeduction = Number(amount) + fee;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const balance = await queryRunner.manager.findOne(WalletBalance, {
        where: { walletAddress: address, currencyCode },
      });

      if (!balance || Number(balance.balance) < totalDeduction) {
        throw new BadRequestException('Insufficient funds');
      }

      // Update balance
      balance.balance = Number(balance.balance) - totalDeduction;
      await queryRunner.manager.save(balance);

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        walletAddress: address,
        currencyCode,
        type: 'SAQUE',
        valor: amount,
        fee: fee,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return {
        message: 'Withdrawal successful',
        amount,
        fee,
        newBalance: balance.balance,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
