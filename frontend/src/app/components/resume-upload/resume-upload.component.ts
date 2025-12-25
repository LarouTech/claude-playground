import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResumeService } from '../../services/resume.service';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-upload.component.html',
  styleUrl: './resume-upload.component.css'
})
export class ResumeUploadComponent {
  selectedFile: File | null = null;
  uploading = false;
  userId = 'demo-user';

  constructor(
    private resumeService: ResumeService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadResume() {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.resumeService.uploadResume(this.userId, this.selectedFile).subscribe({
      next: () => {
        alert('Resume uploaded successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Upload error:', err);
        alert('Error uploading resume. Please try again.');
        this.uploading = false;
      }
    });
  }
}
