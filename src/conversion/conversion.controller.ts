import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConversionService } from './conversion.service';
import { CreateConversionDto } from './dto/create-conversion.dto';
import { Conversion } from './entity/conversion.entity';

@ApiTags('Conversions')
@Controller('carteiras')
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

  @Post(':endereco/conversoes')
  @ApiOperation({ summary: 'Convert currency' })
  @ApiResponse({
    status: 201,
    description: 'Conversion successful',
    type: Conversion,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient funds or invalid data',
  })
  @ApiResponse({ status: 401, description: 'Invalid private key' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async convert(
    @Param('endereco') address: string,
    @Body() createConversionDto: CreateConversionDto,
  ): Promise<Conversion> {
    return this.conversionService.convert(address, createConversionDto);
  }
}
