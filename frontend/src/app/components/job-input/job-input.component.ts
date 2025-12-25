import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { JobService } from '../../services/job.service';
import { ResumeService } from '../../services/resume.service';
import { MatchService } from '../../services/match.service';
import { Resume } from '../../models/resume.model';

@Component({
    selector: 'app-job-input',
    imports: [FormsModule, RouterLink],
    templateUrl: './job-input.component.html',
    styleUrl: './job-input.component.css'
})
export class JobInputComponent {
  jobTitle = '';
  company = '';
  jobDescription = '';
  analyzing = false;
  userId = 'demo-user';
  resumes: Resume[] = [];
  selectedResumeId = '';

  constructor(
    private jobService: JobService,
    private resumeService: ResumeService,
    private matchService: MatchService,
    private router: Router
  ) {
    this.loadResumes();
  }

  loadResumes() {
    this.resumeService.getUserResumes(this.userId).subscribe({
      next: (data) => {
        this.resumes = data;
        if (data.length > 0) {
          this.selectedResumeId = data[0].resumeId;
        }
      },
      error: (err) => console.error('Error loading resumes:', err)
    });
  }

  analyzeJob() {
    this.analyzing = true;
    this.jobService.analyzeJob(this.userId, this.jobDescription, this.jobTitle, this.company).subscribe({
      next: (job) => {
        if (this.selectedResumeId) {
          this.matchService.createMatch(this.userId, this.selectedResumeId, job.jobId).subscribe({
            next: (match) => {
              this.router.navigate(['/match', match.sessionId]);
            },
            error: (err) => {
              console.error('Match error:', err);
              this.analyzing = false;
            }
          });
        } else {
          alert('Job analyzed successfully!');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Analysis error:', err);
        alert('Error analyzing job. Please try again.');
        this.analyzing = false;
      }
    });
  }
}
