import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Resume } from '../models/resume.model';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  constructor(private api: ApiService) {}

  uploadResume(userId: string, file: File): Observable<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);

    return this.api.uploadFile('resume/upload', formData);
  }

  getUserResumes(userId: string): Observable<Resume[]> {
    return this.api.get<Resume[]>(`resume/${userId}`);
  }

  getResume(userId: string, resumeId: string): Observable<Resume> {
    return this.api.get<Resume>(`resume/${userId}/${resumeId}`);
  }

  deleteResume(userId: string, resumeId: string): Observable<void> {
    return this.api.delete<void>(`resume/${userId}/${resumeId}`);
  }
}
