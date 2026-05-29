export interface RuleCondition {
  id: number;
  name: string;
  evaluatedField: string;
  operator: string;
  minValue?: number;
  maxValue?: number;
  points: number;
  resultDescription: string;
}

export interface Rule {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  maxScore: number;
  ruleType: string;
  active: boolean;
  conditions: RuleCondition[];
}
