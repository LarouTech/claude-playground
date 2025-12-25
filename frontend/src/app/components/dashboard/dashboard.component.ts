import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResumeService } from '../../services/resume.service';
import { JobService } from '../../services/job.service';
import { MatchService } from '../../services/match.service';
import { Resume } from '../../models/resume.model';
import { Job } from '../../models/job.model';
import { MatchSession } from '../../models/match.model';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  resumes: Resume[] = [];
  jobs: Job[] = [];
  matches: MatchSession[] = [];
  loading = false;
  userId = 'demo-user'; // In production, get from auth service

  constructor(
    private resumeService: ResumeService,
    private jobService: JobService,
    private matchService: MatchService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    this.resumeService.getUserResumes(this.userId).subscribe({
      next: (data) => this.resumes = data,
      error: (err) => console.error('Error loading resumes:', err)
    });

    this.jobService.getUserJobs(this.userId).subscribe({
      next: (data) => this.jobs = data,
      error: (err) => console.error('Error loading jobs:', err)
    });

    this.matchService.getUserMatches(this.userId).subscribe({
      next: (data) => {
        this.matches = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading matches:', err);
        this.loading = false;
      }
    });
  }

  deleteResume(resumeId: string) {
    if (confirm('Are you sure you want to delete this resume?')) {
      this.resumeService.deleteResume(this.userId, resumeId).subscribe({
        next: () => this.loadDashboardData(),
        error: (err) => console.error('Error deleting resume:', err)
      });
    }
  }

  deleteJob(jobId: string) {
    if (confirm('Are you sure you want to delete this job posting?')) {
      this.jobService.deleteJob(this.userId, jobId).subscribe({
        next: () => this.loadDashboardData(),
        error: (err) => console.error('Error deleting job:', err)
      });
    }
  }
}
