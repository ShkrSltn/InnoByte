import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

class QueryDto {
  query: string;
}

class ExplainQueryDto extends QueryDto {
  maxWords?: number;
}

const examples = {
  example1: {
    value: {
      query:
        'Show all companies in the biotech industry that received funding after 2020.',
    },
    summary: 'Biotech companies with recent funding',
  },
  example2: {
    value: {
      query:
        'What are the top 5 largest funding rounds by amount and which companies received them?',
    },
    summary: 'Top funding rounds',
  },
  example3: {
    value: {
      query:
        'List all ICT companies with female CEOs that received venture capital funding.',
    },
    summary: 'Female-led ICT companies with VC funding',
  },
  example4: {
    value: {
      query:
        'Calculate the total funding amount per industry and sort by highest to lowest.',
    },
    summary: 'Total funding by industry',
  },
  example5: {
    value: {
      query:
        'Find companies that received both Seed and Early Stage funding, and show their total funding amount.',
    },
    summary: 'Companies with multiple funding stages',
  },
  example6: {
    value: {
      query:
        'Which cantons have the most funded startups, and what is the average funding amount in each?',
    },
    summary: 'Funding distribution by canton',
  },
  example7: {
    value: {
      query:
        'List companies that received EXIT type funding and show their acquisition values when available.',
    },
    summary: 'Exit acquisitions',
  },
  example8: {
    value: {
      query:
        'Compare the number of funding rounds and average amounts between spin-offs and non-spin-offs.',
    },
    summary: 'Spin-off vs non-spin-off funding comparison',
  },
  example9: {
    value: {
      query:
        'Show companies founded after 2020 that received funding within their first year of operation.',
    },
    summary: 'Recently founded companies with quick funding',
  },
  example10: {
    value: {
      query:
        'Identify investors who participated in multiple funding rounds and list the companies they invested in.',
    },
    summary: 'Active investors analysis',
  },
};

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze data using natural language query' })
  @ApiResponse({
    status: 200,
    description: 'Returns the SQL query, result and explanation',
  })
  @ApiBody({
    type: QueryDto,
    description: 'The natural language query to analyze data',
    examples: examples,
  })
  async analyzeData(@Body() queryDto: QueryDto) {
    try {
      return await this.aiService.analyzeData(queryDto.query);
    } catch (error) {
      throw new HttpException(
        error.message || 'An error occurred during analysis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze-with-retries')
  @ApiOperation({ summary: 'Analyze data with multiple retries if needed' })
  @ApiResponse({
    status: 200,
    description: 'Returns the SQL query, result and number of attempts made',
  })
  @ApiBody({
    type: QueryDto,
    description: 'The natural language query to analyze data',
    examples: examples,
  })
  async analyzeDataWithRetries(@Body() queryDto: QueryDto) {
    try {
      return await this.aiService.analyzeDataWithRetries(queryDto.query);
    } catch (error) {
      throw new HttpException(
        error.message || 'An error occurred during analysis with retries',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze-and-explain')
  @ApiOperation({
    summary: 'Analyze data and provide an explanation of the results',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns the SQL query, result, number of attempts, and explanation of the data',
  })
  @ApiBody({
    type: ExplainQueryDto,
    description:
      'The natural language query to analyze data with optional maxWords parameter',
    examples: examples,
  })
  async analyzeDataAndExplain(@Body() queryDto: ExplainQueryDto) {
    try {
      return await this.aiService.analyzeDataAndExplain(
        queryDto.query,
        3,
        queryDto.maxWords || 100,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'An error occurred during analysis and explanation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
