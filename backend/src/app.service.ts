import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Job Resume Analyzer API - Ready to help you land your dream job!';
  }
}
