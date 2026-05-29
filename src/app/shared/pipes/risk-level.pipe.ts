import { Pipe, PipeTransform } from '@angular/core';
import { getRiskLabel, normalizeRiskLevel } from '../utils/risk.util';

@Pipe({
  name: 'riskLevel',
  standalone: true,
})
export class RiskLevelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return getRiskLabel(normalizeRiskLevel(value));
  }
}
