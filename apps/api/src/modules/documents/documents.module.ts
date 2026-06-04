import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { LocalStorage } from './storage/local.storage';
import { PrismaModule } from '../../prisma/prisma.module';

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    LocalStorage,
    { provide: STORAGE_PROVIDER, useExisting: LocalStorage },
  ],
  exports: [DocumentsService, STORAGE_PROVIDER],
})
export class DocumentsModule {}
