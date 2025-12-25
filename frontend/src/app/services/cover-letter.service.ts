import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CoverLetter, GenerateCoverLetterRequest } from '../models/cover-letter.model';

@Injectable({
  providedIn: 'root'
})
export class CoverLetterService {
  constructor(private api: ApiService) {}

  generateCoverLetter(request: GenerateCoverLetterRequest): Observable<CoverLetter> {
    return this.api.post<CoverLetter>('cover-letter/generate', request);
  }

  getCoverLetter(userId: string, sessionId: string): Observable<CoverLetter> {
    return this.api.get<CoverLetter>(`cover-letter/${userId}/${sessionId}`);
  }
}
