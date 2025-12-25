import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ResumeModule } from './modules/resume/resume.module';
import { JobModule } from './modules/job/job.module';
import { MatcherModule } from './modules/matcher/matcher.module';
import { SuggestionsModule } from './modules/suggestions/suggestions.module';
import { CoverLetterModule } from './modules/cover-letter/cover-letter.module';
import { StorageModule } from './modules/storage/storage.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
    ResumeModule,
    JobModule,
    MatcherModule,
    SuggestionsModule,
    CoverLetterModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
