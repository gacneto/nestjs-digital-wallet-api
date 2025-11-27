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
  @ApiOperation({ summary: 'Criar nova carteira' })
  @ApiResponse({
    status: 201,
    description: 'Carteira criada com sucesso',
    type: WalletResponseDto,
  })
  criarCarteira(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.criarCarteira(createWalletDto);
  }

  @Get(':endereco')
  @ApiOperation({ summary: 'Consultar detalhes da carteira' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da carteira retornados com sucesso',
  })
  consultarCarteira(@Param('endereco') address: string) {
    return this.walletService.consultarCarteira(address);
  }

  @Get(':endereco/saldos')
  @ApiOperation({ summary: 'Consultar saldos da carteira' })
  @ApiResponse({ status: 200, description: 'Saldos retornados com sucesso' })
  consultarSaldo(@Param('endereco') address: string) {
    return this.walletService.consultarSaldo(address);
  }
}
