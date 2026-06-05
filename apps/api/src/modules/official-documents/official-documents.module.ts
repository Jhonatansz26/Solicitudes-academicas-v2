import { Module } from '@nestjs/common';
import { OfficialDocumentsController } from './official-documents.controller';
import { GlobalOfficialDocumentsController } from './global-official-documents.controller';
import { OfficialDocumentsService } from './official-documents.service';
import { PdfService } from './pdf.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { DocumentsModule } from '../documents/documents.module';
import { AutoDocumentGenerationListener } from './auto-document-generation.listener';

@Module({
  imports: [PrismaModule, DocumentsModule],
  controllers: [OfficialDocumentsController, GlobalOfficialDocumentsController],
  providers: [
    OfficialDocumentsService,
    PdfService,
    AutoDocumentGenerationListener,
  ],
  exports: [OfficialDocumentsService, PdfService],
})
export class OfficialDocumentsModule {}
