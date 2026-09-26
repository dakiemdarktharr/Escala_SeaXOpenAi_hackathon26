export interface RetrievalDocument {
  id: string;
  version: string;
  title: string;
  content: string;
  sourceLabel: string;
  type: string;
  status: string;
  effectiveFrom: string;
  tags: string[];
  conflictGroup?: string;
}
export interface RetrievedEvidence {
  id: string;
  version: string;
  title: string;
  content: string;
  sourceLabel: string;
  type: string;
  score: number;
  matchedTerms: string[];
  conflict?: true;
}
export function retrieveKnowledge(
  query: string,
  documents: RetrievalDocument[],
  options: { asOf: string; limit?: number },
): { status: "FOUND" | "EMPTY" | "CONFLICTING"; evidence: RetrievedEvidence[] };