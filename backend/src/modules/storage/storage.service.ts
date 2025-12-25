import { Injectable } from '@nestjs/common';
import { DynamoDbService } from './dynamodb.service';
import { S3Service } from './s3.service';

@Injectable()
export class StorageService {
  constructor(
    private readonly dynamoDb: DynamoDbService,
    private readonly s3: S3Service,
  ) {}

  // Proxy methods for DynamoDB
  async saveItem(item: any) {
    return this.dynamoDb.putItem(item);
  }

  async getItem(pk: string, sk: string) {
    return this.dynamoDb.getItem(pk, sk);
  }

  async query(pk: string, skPrefix?: string) {
    return this.dynamoDb.query(pk, skPrefix);
  }

  async updateItem(pk: string, sk: string, updates: any) {
    return this.dynamoDb.updateItem(pk, sk, updates);
  }

  async deleteItem(pk: string, sk: string) {
    return this.dynamoDb.deleteItem(pk, sk);
  }

  // Proxy methods for S3
  async uploadFile(key: string, body: Buffer, contentType?: string) {
    return this.s3.uploadFile(key, body, contentType);
  }

  async getFile(key: string) {
    return this.s3.getFile(key);
  }

  async deleteFile(key: string) {
    return this.s3.deleteFile(key);
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600) {
    return this.s3.getPresignedUrl(key, expiresIn);
  }
}
