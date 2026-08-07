export type VacancyStatus = 'DRAFT' | 'OPEN' | 'CLOSED';

export interface Requirement {
  id: number;
  description: string;
}

export interface VacancyRequest {
  title: string;
  description?: string;
  requirements: string[];
  status: VacancyStatus;
}

export interface VacancyResponse {
  id: number;
  title: string;
  description: string | null;
  requirements: Requirement[];
  status: VacancyStatus;
  createdBy: { id: number; name: string };
  createdAt: string;
}

export interface StatusUpdateRequest {
  status: VacancyStatus;
}
