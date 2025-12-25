import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Suggestion } from '../models/suggestion.model';

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {
  constructor(private api: ApiService) {}

  getSuggestions(sessionId: string): Observable<Suggestion[]> {
    return this.api.get<Suggestion[]>(`suggestions/session/${sessionId}`);
  }

  acknowledgeSuggestion(userId: string, suggestionId: string, implementationNotes?: string): Observable<void> {
    return this.api.post<void>('suggestions/acknowledge', {
      userId,
      suggestionId,
      implementationNotes,
    });
  }
}
