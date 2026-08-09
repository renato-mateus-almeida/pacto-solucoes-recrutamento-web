export interface EvaluationRequest {
  feedback?: string;
}

export interface EvaluationResponse {
  id: number;
  feedback: string | null;
  evaluator: { id: number; name: string };
  createdAt: string;
}
