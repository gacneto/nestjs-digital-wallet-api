import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entity/wallet.entity';
import { WalletBalance } from '../wallet-balance/wallet-balance.entity';
import { Currency } from '../currency/currency.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletBalance)
    private walletBalanceRepository: Repository<WalletBalance>,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
  ) {}

  async criarCarteira(
    createWalletDto: CreateWalletDto,
  ): Promise<WalletResponseDto> {
    const address = '0x' + crypto.randomBytes(20).toString('hex');
    const privateKey =
      createWalletDto.privateKey || crypto.randomBytes(32).toString('hex');
    const privateKeyHash = await bcrypt.hash(privateKey, 10);

    const wallet = this.walletRepository.create({
      address,
      privateKeyHash,
    });

    await this.walletRepository.save(wallet);

    const currencies = await this.currencyRepository.find();
    const balances = currencies.map((currency) =>
      this.walletBalanceRepository.create({
        walletAddress: address,
        currencyCode: currency.code,
        balance: 0,
      }),
    );

    await this.walletBalanceRepository.save(balances);

    return {
      address,
      privateKey,
    };
  }

  async consultarSaldo(address: string): Promise<WalletBalance[]> {
    const wallet = await this.walletRepository.findOne({ where: { address } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return this.walletBalanceRepository.find({
      where: { walletAddress: address },
      relations: ['currency'],
    });
  }

  async consultarCarteira(address: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { address } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }
}
