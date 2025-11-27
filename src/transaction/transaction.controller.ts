import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';

@ApiTags('transacoes')
@Controller('carteiras')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post(':endereco/depositos')
  @ApiOperation({ summary: 'Realizar depósito' })
  @ApiResponse({ status: 201, description: 'Depósito realizado com sucesso' })
  realizarDeposito(
    @Param('endereco') address: string,
    @Body() createDepositDto: CreateDepositDto,
  ) {
    return this.transactionService.realizarDeposito(address, createDepositDto);
  }

  @Post(':endereco/saques')
  @ApiOperation({ summary: 'Realizar saque' })
  @ApiResponse({ status: 201, description: 'Saque realizado com sucesso' })
  realizarSaque(
    @Param('endereco') address: string,
    @Body() createWithdrawDto: CreateWithdrawDto,
  ) {
    return this.transactionService.realizarSaque(address, createWithdrawDto);
  }
}
