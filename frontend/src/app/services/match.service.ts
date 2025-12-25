import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MatchSession } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  constructor(private api: ApiService) {}

  createMatch(userId: string, resumeId: string, jobId: string): Observable<MatchSession> {
    return this.api.post<MatchSession>('match', {
      userId,
      resumeId,
      jobId,
    });
  }

  getMatchAnalysis(userId: string, sessionId: string): Observable<MatchSession> {
    return this.api.get<MatchSession>(`match/${userId}/${sessionId}`);
  }

  getUserMatches(userId: string): Observable<MatchSession[]> {
    return this.api.get<MatchSession[]>(`match/${userId}`);
  }
}
