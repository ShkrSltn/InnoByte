import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';
import { Session } from '../entities/metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  controllers: [MetadataController],
  providers: [MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}
