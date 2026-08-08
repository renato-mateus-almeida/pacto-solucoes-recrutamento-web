export interface EvaluationRequest {
  score: number;
  feedback?: string;
}

export interface EvaluationResponse {
  id: number;
  score: number;
  feedback: string | null;
  evaluator: { id: number; name: string };
  createdAt: string;
}
