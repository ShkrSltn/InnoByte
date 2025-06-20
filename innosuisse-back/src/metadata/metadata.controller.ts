import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { Session } from '../entities/metadata.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateSessionDto } from './dto/create-session.dto';

@ApiTags('metadata')
@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new session' })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Session successfully created',
    type: Session,
  })
  async createSession(@Body() sessionData: CreateSessionDto): Promise<Session> {
    try {
      return await this.metadataService.createSession(sessionData);
    } catch (error) {
      throw new HttpException(
        'Failed to create session',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all sessions',
    type: [Session],
  })
  async getAllSessions(): Promise<Session[]> {
    return this.metadataService.findAllSessions();
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the session',
    type: Session,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  async getSessionById(@Param('id') id: string): Promise<Session> {
    try {
      return await this.metadataService.findSessionById(id);
    } catch (error) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }
  }

  @Put('sessions/:id')
  @ApiOperation({ summary: 'Update a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session successfully updated',
    type: Session,
  })
  async updateSession(
    @Param('id') id: string,
    @Body() sessionData: Partial<Session>,
  ): Promise<Session> {
    try {
      return await this.metadataService.updateSession(id, sessionData);
    } catch (error) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Session successfully deleted',
  })
  async deleteSession(@Param('id') id: string): Promise<void> {
    try {
      return await this.metadataService.deleteSession(id);
    } catch (error) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }
  }
}
