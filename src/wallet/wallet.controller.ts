import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';

@ApiTags('carteiras')
@Controller('carteiras')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({
    status: 201,
    description: 'Wallet created',
    type: WalletResponseDto,
  })
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.create(createWalletDto);
  }

  @Get(':endereco')
  @ApiOperation({ summary: 'Get wallet details' })
  @ApiResponse({ status: 200, description: 'Wallet details' })
  getWallet(@Param('endereco') address: string) {
    return this.walletService.getWallet(address);
  }

  @Get(':endereco/saldos')
  @ApiOperation({ summary: 'Get wallet balances' })
  @ApiResponse({ status: 200, description: 'Wallet balances' })
  getBalance(@Param('endereco') address: string) {
    return this.walletService.getBalance(address);
  }
}
