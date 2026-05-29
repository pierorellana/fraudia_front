import { RiskLevel } from '../../../core/models/common.model';

export interface CriticalCase {
  claimId: string;
  finalScore: number;
  riskLevel: RiskLevel;
  claimedAmount: number;
  branch: string;
  mainReasons: string[];
  recommendation: string;
}

export interface ExecutiveSummary {
  title: string;
  period: {
    from: string;
    to: string;
  };
  metrics: {
    totalClaims: number;
    redCases: number;
    yellowCases: number;
    highRiskAmount: number;
  };
  summary: string;
  recommendations: string[];
}
