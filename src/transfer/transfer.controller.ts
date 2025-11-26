import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Transfer } from './entity/transfer.entity';

@ApiTags('Transfers')
@Controller('carteiras')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post(':endereco_origem/transferencias')
  @ApiOperation({ summary: 'Transfer funds' })
  @ApiResponse({
    status: 201,
    description: 'Transfer successful',
    type: Transfer,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient funds or invalid data',
  })
  @ApiResponse({ status: 401, description: 'Invalid private key' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async transfer(
    @Param('endereco_origem') sourceAddress: string,
    @Body() createTransferDto: CreateTransferDto,
  ): Promise<Transfer> {
    return this.transferService.transfer(sourceAddress, createTransferDto);
  }
}
