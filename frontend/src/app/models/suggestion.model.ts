export interface Suggestion {
  id: string;
  category: 'skill' | 'experience' | 'education' | 'formatting' | 'content';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: string;
  acknowledged?: boolean;
  acknowledgedAt?: Date;
  implementationNotes?: string;
}
