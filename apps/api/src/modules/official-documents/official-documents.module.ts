import { Module } from '@nestjs/common';
import { OfficialDocumentsController } from './official-documents.controller';
import { OfficialDocumentsService } from './official-documents.service';
import { PdfService } from './pdf.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [PrismaModule, DocumentsModule],
  controllers: [OfficialDocumentsController],
  providers: [OfficialDocumentsService, PdfService],
  exports: [OfficialDocumentsService, PdfService],
})
export class OfficialDocumentsModule {}
