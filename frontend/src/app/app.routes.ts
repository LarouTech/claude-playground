import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ResumeUploadComponent } from './components/resume-upload/resume-upload.component';
import { JobInputComponent } from './components/job-input/job-input.component';
import { MatchResultsComponent } from './components/match-results/match-results.component';
import { SuggestionsComponent } from './components/suggestions/suggestions.component';
import { CoverLetterComponent } from './components/cover-letter/cover-letter.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'upload-resume', component: ResumeUploadComponent },
  { path: 'job-input', component: JobInputComponent },
  { path: 'match/:sessionId', component: MatchResultsComponent },
  { path: 'suggestions/:sessionId', component: SuggestionsComponent },
  { path: 'cover-letter/:sessionId', component: CoverLetterComponent },
];
