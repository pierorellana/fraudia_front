import { RiskLevel } from '../../core/models/common.model';

export function normalizeRiskLevel(value: string | null | undefined): RiskLevel {
  const normalized = (value ?? 'verde').toString().trim().toLowerCase();

  if (normalized.includes('crit')) {
    return 'critico';
  }

  if (
    normalized.includes('rojo') ||
    normalized.includes('alto') ||
    normalized.includes('red') ||
    normalized.includes('high')
  ) {
    return 'rojo';
  }

  if (
    normalized.includes('amarillo') ||
    normalized.includes('medio') ||
    normalized.includes('yellow') ||
    normalized.includes('medium')
  ) {
    return 'amarillo';
  }

  if (normalized.includes('verde') || normalized.includes('bajo') || normalized.includes('green') || normalized.includes('low')) {
    return 'verde';
  }

  return 'verde';
}

export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    verde: 'Verde',
    amarillo: 'Amarillo',
    rojo: 'Rojo',
    critico: 'Crítico',
  };
  return labels[level];
}

export function getRiskDescription(level: RiskLevel): string {
  const descriptions: Record<RiskLevel, string> = {
    verde: 'Bajo riesgo',
    amarillo: 'Riesgo medio',
    rojo: 'Alto riesgo',
    critico: 'Riesgo crítico',
  };
  return descriptions[level];
}

export function getRiskLevelFromScore(score: number | null | undefined): RiskLevel {
  const normalizedScore = score ?? 0;
  if (normalizedScore <= 40) {
    return 'verde';
  }

  if (normalizedScore <= 75) {
    return 'amarillo';
  }

  return 'rojo';
}

export function calculatePercentage(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}
