import { ApplicationStatus } from './application.model';

export interface DashboardApplication {
  id: number;
  vacancy: { id: number; title: string };
  status: ApplicationStatus;
  appliedAt: string;
  feedback: string | null;
}

export interface DashboardResponse {
  totalApplications: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  applications: DashboardApplication[];
}
