import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('main')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('companies')
  @ApiOperation({ summary: 'Get first 10 companies' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of first 10 companies',
  })
  getCompanies() {
    return this.appService.getCompanies();
  }
}
