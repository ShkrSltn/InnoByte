import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Company } from 'src/entities/company.entity';

@ApiTags('companies')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('stats/by-year')
  @ApiOperation({ summary: 'Get companies count by year for specific canton' })
  @ApiQuery({
    name: 'canton',
    description: 'Canton code (e.g. BE, ZH)',
    required: true,
  })
  @ApiQuery({
    name: 'startYear',
    description: 'Start year for the range',
    required: true,
  })
  @ApiQuery({
    name: 'endYear',
    description: 'End year for the range',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns count of companies by year for specified canton and year range',
    schema: {
      properties: {
        totalCompanies: { type: 'number' },
        companiesByYear: {
          type: 'array',
          items: {
            properties: {
              year: { type: 'number' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getCompaniesCountByYear(
    @Query('canton') canton: string,
    @Query('startYear', ParseIntPipe) startYear: number,
    @Query('endYear', ParseIntPipe) endYear: number,
  ) {
    return this.companyService.getCompaniesCountByYear(
      canton,
      startYear,
      endYear,
    );
  }

  @Get('by-canton-and-years')
  @ApiOperation({ summary: 'Get companies by canton and year range' })
  @ApiQuery({
    name: 'canton',
    description: 'Canton code (e.g. BE, ZH)',
    required: true,
  })
  @ApiQuery({
    name: 'startYear',
    description: 'Start year for the range',
    required: true,
  })
  @ApiQuery({
    name: 'endYear',
    description: 'End year for the range',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns companies for specified canton and year range',
    type: [Company],
  })
  async getCompaniesByCantonAndYearRange(
    @Query('canton') canton: string,
    @Query('startYear', ParseIntPipe) startYear: number,
    @Query('endYear', ParseIntPipe) endYear: number,
  ) {
    return this.companyService.getCompaniesByCantonAndYearRange(
      canton,
      startYear,
      endYear,
    );
  }
}
