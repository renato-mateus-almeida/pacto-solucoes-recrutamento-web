export type ApplicationStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface ApplicationRequest {
  vacancyId: number;
}

export interface ApplicationResponse {
  id: number;
  vacancy: { id: number; title: string };
  candidate: { id: number; name: string };
  status: ApplicationStatus;
  appliedAt: string;
}

export interface ApplicationStatusUpdate {
  status: ApplicationStatus;
}
