import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SuggestionService } from '../../services/suggestion.service';
import { Suggestion } from '../../models/suggestion.model';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suggestions.component.html',
  styleUrl: './suggestions.component.css'
})
export class SuggestionsComponent implements OnInit {
  suggestions: Suggestion[] = [];
  loading = true;
  userId = 'demo-user';

  constructor(
    private route: ActivatedRoute,
    private suggestionService: SuggestionService
  ) {}

  ngOnInit() {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    if (sessionId) {
      this.suggestionService.getSuggestions(sessionId).subscribe({
        next: (data) => {
          this.suggestions = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading suggestions:', err);
          this.loading = false;
        }
      });
    }
  }

  acknowledgeSuggestion(suggestion: Suggestion) {
    const notes = prompt('Add implementation notes (optional):');
    this.suggestionService.acknowledgeSuggestion(this.userId, suggestion.id, notes || undefined).subscribe({
      next: () => {
        suggestion.acknowledged = true;
        suggestion.implementationNotes = notes || undefined;
      },
      error: (err) => console.error('Error:', err)
    });
  }
}
