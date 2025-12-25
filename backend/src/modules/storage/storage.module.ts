import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { DynamoDbService } from './dynamodb.service';
import { S3Service } from './s3.service';

@Module({
  providers: [StorageService, DynamoDbService, S3Service],
  exports: [StorageService, DynamoDbService, S3Service],
})
export class StorageModule {}
