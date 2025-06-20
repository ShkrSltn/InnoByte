import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/metadata.entity';

@Injectable()
export class MetadataService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async createSession(sessionData: Partial<Session>): Promise<Session> {
    const session = new Session();

    session.role_selected = sessionData.role_selected || '';
    session.industry_selected = sessionData.industry_selected || '';
    session.region_selected = sessionData.region_selected || '';
    session.funding_stage_selected = sessionData.funding_stage_selected || '';

    return this.sessionRepository.save(session);
  }

  async findAllSessions(): Promise<Session[]> {
    return this.sessionRepository.find();
  }

  async findSessionById(id: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { session_id: id },
    });
    if (!session) {
      throw new Error(`Session with ID ${id} not found`);
    }
    return session;
  }

  async updateSession(
    id: string,
    sessionData: Partial<Session>,
  ): Promise<Session> {
    await this.sessionRepository.update(id, sessionData);
    return this.findSessionById(id);
  }

  async deleteSession(id: string): Promise<void> {
    await this.sessionRepository.delete(id);
  }
}
