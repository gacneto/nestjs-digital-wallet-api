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
  @ApiOperation({ summary: 'Make a deposit' })
  @ApiResponse({ status: 201, description: 'Deposit successful' })
  deposit(
    @Param('endereco') address: string,
    @Body() createDepositDto: CreateDepositDto,
  ) {
    return this.transactionService.deposit(address, createDepositDto);
  }

  @Post(':endereco/saques')
  @ApiOperation({ summary: 'Make a withdrawal' })
  @ApiResponse({ status: 201, description: 'Withdrawal successful' })
  withdraw(
    @Param('endereco') address: string,
    @Body() createWithdrawDto: CreateWithdrawDto,
  ) {
    return this.transactionService.withdraw(address, createWithdrawDto);
  }
}
