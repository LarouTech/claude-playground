import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { MatchSession } from '../../models/match.model';

@Component({
    selector: 'app-match-results',
    imports: [CommonModule, RouterLink],
    templateUrl: './match-results.component.html',
    styleUrl: './match-results.component.css'
})
export class MatchResultsComponent implements OnInit {
  match: MatchSession | null = null;
  loading = true;
  userId = 'demo-user';

  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService
  ) {}

  ngOnInit() {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    if (sessionId) {
      this.matchService.getMatchAnalysis(this.userId, sessionId).subscribe({
        next: (data) => {
          this.match = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading match:', err);
          this.loading = false;
        }
      });
    }
  }

  getScoreColor(score: number): string {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  }

  getPriorityColor(priority: string): string {
    if (priority === 'high') return 'bg-red-100 text-red-800';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  }
}
