import { Readable } from 'stream';

export interface StorageResult {
  url: string;
  fileName: string;
  fileSize: number;
}

export interface StorageProvider {
  upload(
    file: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<StorageResult>;
  delete(fileName: string): Promise<void>;
  getStream(fileName: string): Promise<Readable>;
  fileExists(fileName: string): Promise<boolean>;
}
