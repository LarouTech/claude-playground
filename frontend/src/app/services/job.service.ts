import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Job } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(private api: ApiService) {}

  analyzeJob(userId: string, jobDescription: string, jobTitle?: string, company?: string): Observable<Job> {
    return this.api.post<Job>('job/analyze', {
      userId,
      jobDescription,
      jobTitle,
      company,
    });
  }

  getUserJobs(userId: string): Observable<Job[]> {
    return this.api.get<Job[]>(`job/${userId}`);
  }

  getJob(userId: string, jobId: string): Observable<Job> {
    return this.api.get<Job>(`job/${userId}/${jobId}`);
  }

  deleteJob(userId: string, jobId: string): Observable<void> {
    return this.api.delete<void>(`job/${userId}/${jobId}`);
  }
}
