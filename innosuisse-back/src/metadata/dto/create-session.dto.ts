import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Selected role', required: false })
  role_selected?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Selected industry', required: false })
  industry_selected?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Selected region', required: false })
  region_selected?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Selected funding stage', required: false })
  funding_stage_selected?: string;
}
