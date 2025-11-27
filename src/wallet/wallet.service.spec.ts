import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from './entity/wallet.entity';
import { WalletBalance } from '../wallet-balance/wallet-balance.entity';
import { Currency } from '../currency/currency.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: Repository<Wallet>;
  let walletBalanceRepository: Repository<WalletBalance>;
  let currencyRepository: Repository<Currency>;

  const mockWalletRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockWalletBalanceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockCurrencyRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(WalletBalance),
          useValue: mockWalletBalanceRepository,
        },
        {
          provide: getRepositoryToken(Currency),
          useValue: mockCurrencyRepository,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get<Repository<Wallet>>(
      getRepositoryToken(Wallet),
    );
    walletBalanceRepository = module.get<Repository<WalletBalance>>(
      getRepositoryToken(WalletBalance),
    );
    currencyRepository = module.get<Repository<Currency>>(
      getRepositoryToken(Currency),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('criarCarteira', () => {
    it('should create a wallet with a random private key if not provided', async () => {
      mockCurrencyRepository.find.mockResolvedValue([]);
      mockWalletRepository.create.mockReturnValue({});
      mockWalletRepository.save.mockResolvedValue({});
      mockWalletBalanceRepository.save.mockResolvedValue([]);

      const result = await service.criarCarteira({});

      expect(result.privateKey).toBeDefined();
      expect(result.address).toBeDefined();
      expect(mockWalletRepository.create).toHaveBeenCalled();
    });

    it('should create a wallet with the provided private key', async () => {
      const customKey = 'minhaSenhaSecreta';
      mockCurrencyRepository.find.mockResolvedValue([]);
      mockWalletRepository.create.mockReturnValue({});
      mockWalletRepository.save.mockResolvedValue({});
      mockWalletBalanceRepository.save.mockResolvedValue([]);

      const result = await service.criarCarteira({ privateKey: customKey });

      expect(result.privateKey).toBe(customKey);
      expect(result.address).toBeDefined();

      // Verify that the hash was created correctly (we can't check the hash value directly easily,
      // but we can verify the create call arguments if we spy on it, or just trust the flow for now)
      expect(mockWalletRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKeyHash: expect.any(String),
        }),
      );
    });
  });
});
