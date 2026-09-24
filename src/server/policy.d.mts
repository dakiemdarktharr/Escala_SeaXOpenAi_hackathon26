import type { RecommendationAction } from "@/domain/contracts";

export function detectHardRisk(text: string, scenario?: string): { hard: boolean; reasons: string[] };

export function evaluateRecommendation(input: {
  text: string;
  scenario: string;
  confidence: number | null;
  missingInformation?: string[];
  evidenceIds?: string[];
  threshold?: number;
  hasApprovedAnswer?: boolean;
}): { action: RecommendationAction; reasons: string[] };

export const APPROVED_AVAILABILITY_ANSWER: string;
