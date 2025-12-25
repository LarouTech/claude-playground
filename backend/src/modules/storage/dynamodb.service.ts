import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand as DocQueryCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDbService {
  private readonly logger = new Logger(DynamoDbService.name);
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get('AWS_REGION') || 'us-east-1';
    this.tableName =
      this.configService.get('DYNAMODB_TABLE') ||
      'job-resume-analyzer-dev';

    const ddbClient = new DynamoDBClient({ region });
    this.client = DynamoDBDocumentClient.from(ddbClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: false,
      },
    });
  }

  async putItem(item: any): Promise<void> {
    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            ...item,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      );
      this.logger.log(`Item saved: ${item.PK}/${item.SK}`);
    } catch (error) {
      this.logger.error(`Error saving item: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getItem(pk: string, sk: string): Promise<any> {
    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { PK: pk, SK: sk },
        }),
      );
      return result.Item;
    } catch (error) {
      this.logger.error(`Error getting item: ${error.message}`, error.stack);
      throw error;
    }
  }

  async query(pk: string, skPrefix?: string): Promise<any[]> {
    try {
      const params: any = {
        TableName: this.tableName,
        KeyConditionExpression: skPrefix
          ? 'PK = :pk AND begins_with(SK, :sk)'
          : 'PK = :pk',
        ExpressionAttributeValues: skPrefix
          ? { ':pk': pk, ':sk': skPrefix }
          : { ':pk': pk },
      };

      const result = await this.client.send(new DocQueryCommand(params));
      return result.Items || [];
    } catch (error) {
      this.logger.error(`Error querying items: ${error.message}`, error.stack);
      throw error;
    }
  }

  async queryByGSI(
    indexName: string,
    gsiPk: string,
    gsiSkPrefix?: string,
  ): Promise<any[]> {
    try {
      const params: any = {
        TableName: this.tableName,
        IndexName: indexName,
        KeyConditionExpression: gsiSkPrefix
          ? 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)'
          : 'GSI1PK = :pk',
        ExpressionAttributeValues: gsiSkPrefix
          ? { ':pk': gsiPk, ':sk': gsiSkPrefix }
          : { ':pk': gsiPk },
      };

      const result = await this.client.send(new DocQueryCommand(params));
      return result.Items || [];
    } catch (error) {
      this.logger.error(
        `Error querying GSI items: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateItem(pk: string, sk: string, updates: any): Promise<void> {
    try {
      const updateExpressions: string[] = [];
      const expressionAttributeNames: any = {};
      const expressionAttributeValues: any = {};

      Object.keys(updates).forEach((key, index) => {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;
        updateExpressions.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = updates[key];
      });

      // Always update updatedAt
      updateExpressions.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      await this.client.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { PK: pk, SK: sk },
          UpdateExpression: `SET ${updateExpressions.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        }),
      );

      this.logger.log(`Item updated: ${pk}/${sk}`);
    } catch (error) {
      this.logger.error(`Error updating item: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteItem(pk: string, sk: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { PK: pk, SK: sk },
        }),
      );
      this.logger.log(`Item deleted: ${pk}/${sk}`);
    } catch (error) {
      this.logger.error(`Error deleting item: ${error.message}`, error.stack);
      throw error;
    }
  }
}
