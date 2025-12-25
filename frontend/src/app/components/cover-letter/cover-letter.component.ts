import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CoverLetterService } from '../../services/cover-letter.service';
import { CoverLetter } from '../../models/cover-letter.model';

@Component({
    selector: 'app-cover-letter',
    imports: [CommonModule, FormsModule],
    templateUrl: './cover-letter.component.html',
    styleUrl: './cover-letter.component.css'
})
export class CoverLetterComponent implements OnInit {
  coverLetter: CoverLetter | null = null;
  loading = false;
  generating = false;
  tone: 'professional' | 'casual' | 'enthusiastic' = 'professional';
  additionalInfo = '';
  userId = 'demo-user';
  sessionId = '';

  constructor(
    private route: ActivatedRoute,
    private coverLetterService: CoverLetterService
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';
    this.loadCoverLetter();
  }

  loadCoverLetter() {
    this.loading = true;
    this.coverLetterService.getCoverLetter(this.userId, this.sessionId).subscribe({
      next: (data) => {
        this.coverLetter = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cover letter:', err);
        this.loading = false;
      }
    });
  }

  generateCoverLetter() {
    this.generating = true;
    this.coverLetterService.generateCoverLetter({
      userId: this.userId,
      sessionId: this.sessionId,
      tone: this.tone,
      additionalInfo: this.additionalInfo || undefined
    }).subscribe({
      next: (data) => {
        this.coverLetter = data;
        this.generating = false;
      },
      error: (err) => {
        console.error('Error generating cover letter:', err);
        alert('Error generating cover letter. Please try again.');
        this.generating = false;
      }
    });
  }

  copyToClipboard() {
    if (this.coverLetter) {
      navigator.clipboard.writeText(this.coverLetter.coverLetter);
      alert('Cover letter copied to clipboard!');
    }
  }
}
