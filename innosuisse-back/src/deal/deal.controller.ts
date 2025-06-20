import { IDealData } from './types/deal.interfaces';
import { Controller, Get, Query } from '@nestjs/common';
import { DealService } from './deal.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('deals')
@Controller('deal')
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @Get('industries')
  @ApiOperation({ summary: 'Get all unique industries from companies' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of unique industries',
    schema: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  async getUniqueIndustries() {
    return this.dealService.getUniqueIndustries();
  }

  @Get('cantons')
  @ApiOperation({ summary: 'Get all unique cantons from deals' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of unique cantons',
    schema: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  async getUniqueCantons() {
    return this.dealService.getUniqueCantons();
  }

  @Get('phases')
  @ApiOperation({ summary: 'Get all unique phases from deals' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of unique phases',
    schema: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  async getUniquePhases() {
    return this.dealService.getUniquePhases();
  }

  @Get('years')
  @ApiOperation({ summary: 'Get all unique years from funding rounds dates' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of unique years',
    schema: {
      type: 'array',
      items: { type: 'number' },
    },
  })
  async getUniqueYears() {
    return this.dealService.getUniqueYears();
  }

  @Get('all-data')
  @ApiOperation({
    summary: 'Get all deals with selected fields in table format',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns array of deals with company name, investors, amount, phase, canton, industry, and date',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          companyName: { type: 'string' },
          investors: { type: 'string' },
          amount: { type: 'number' },
          phase: { type: 'string' },
          canton: { type: 'string' },
          industry: { type: 'string' },
          date: { type: 'string', format: 'date' },
        },
      },
    },
  })
  async getAllData(): Promise<IDealData[]> {
    return this.dealService.getAllDealsData();
  }

  @Get('filter')
  @ApiOperation({
    summary: 'Filter deals by industry, canton, phase, and year range',
  })
  @ApiQuery({
    name: 'industries',
    description: 'List of industries to filter by',
    required: false,
    isArray: true,
  })
  @ApiQuery({
    name: 'cantons',
    description: 'List of cantons to filter by',
    required: false,
    isArray: true,
  })
  @ApiQuery({
    name: 'phases',
    description: 'List of phases to filter by',
    required: false,
    isArray: true,
  })
  @ApiQuery({
    name: 'yearFrom',
    description: 'Start year for filtering (inclusive)',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'yearTo',
    description: 'End year for filtering (inclusive)',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns filtered deals',
    schema: {
      properties: {
        totalDeals: { type: 'number' },
        deals: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  })
  async filterDeals(
    @Query('industries') industries?: string | string[],
    @Query('cantons') cantons?: string | string[],
    @Query('phases') phases?: string | string[],
    @Query('yearFrom') yearFrom?: string,
    @Query('yearTo') yearTo?: string,
  ) {
    const parseQueryParam = (
      param: string | string[] | undefined,
    ): string[] | undefined => {
      if (!param) return undefined;

      if (Array.isArray(param)) return param;

      if (param.includes(',')) {
        return param.split(',').map((item) => item.trim());
      }

      return [param];
    };

    const industriesArray = parseQueryParam(industries);
    const cantonsArray = parseQueryParam(cantons);
    const phasesArray = parseQueryParam(phases);

    const yearFromNumber = yearFrom ? parseInt(yearFrom, 10) : undefined;
    const yearToNumber = yearTo ? parseInt(yearTo, 10) : undefined;

    return this.dealService.findDealsByFilters({
      industries: industriesArray,
      cantons: cantonsArray,
      phases: phasesArray,
      yearFrom: yearFromNumber,
      yearTo: yearToNumber,
    });
  }
}
