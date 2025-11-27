import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Transfer } from './entity/transfer.entity';

@ApiTags('transferencias')
@Controller('carteiras')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post(':endereco_origem/transferencias')
  @ApiOperation({ summary: 'Realizar transferência' })
  @ApiResponse({
    status: 201,
    description: 'Transferência realizada com sucesso',
    type: Transfer,
  })
  @ApiResponse({
    status: 400,
    description: 'Saldo insuficiente ou dados inválidos',
  })
  @ApiResponse({ status: 401, description: 'Chave privada inválida' })
  @ApiResponse({ status: 404, description: 'Carteira não encontrada' })
  async realizarTransferencia(
    @Param('endereco_origem') sourceAddress: string,
    @Body() createTransferDto: CreateTransferDto,
  ): Promise<Transfer> {
    return this.transferService.realizarTransferencia(
      sourceAddress,
      createTransferDto,
    );
  }
}
