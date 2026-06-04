import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider, StorageResult } from './storage.interface';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import { join, resolve, normalize } from 'path';
import { Readable } from 'stream';

@Injectable()
export class LocalStorage implements StorageProvider {
  private uploadsDir: string;

  constructor(private configService: ConfigService) {
    this.uploadsDir = resolve(process.cwd(), 'uploads');
  }

  async upload(
    file: Buffer,
    fileName: string,
    _mimeType: string,
  ): Promise<StorageResult> {
    const safeName = this.sanitizeFileName(fileName);
    const fullPath = join(this.uploadsDir, safeName);

    if (!fullPath.startsWith(this.uploadsDir)) {
      throw new BadRequestException('Invalid file path');
    }

    const fs = await import('fs/promises');
    await fs.mkdir(this.uploadsDir, { recursive: true });
    await fs.writeFile(fullPath, file);

    const url = `/api/documents/${safeName}/file`;
    return { url, fileName: safeName, fileSize: file.length };
  }

  async delete(fileName: string): Promise<void> {
    const safeName = this.sanitizeFileName(fileName);
    const fullPath = join(this.uploadsDir, safeName);

    if (!fullPath.startsWith(this.uploadsDir)) {
      throw new BadRequestException('Invalid file path');
    }

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }

  async getStream(fileName: string): Promise<Readable> {
    const safeName = this.sanitizeFileName(fileName);
    const fullPath = join(this.uploadsDir, safeName);

    if (!fullPath.startsWith(this.uploadsDir)) {
      throw new BadRequestException('Invalid file path');
    }

    if (!existsSync(fullPath)) {
      throw new BadRequestException('File not found');
    }

    return createReadStream(fullPath);
  }

  async fileExists(fileName: string): Promise<boolean> {
    const safeName = this.sanitizeFileName(fileName);
    const fullPath = join(this.uploadsDir, safeName);
    return fullPath.startsWith(this.uploadsDir) && existsSync(fullPath);
  }

  private sanitizeFileName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}
