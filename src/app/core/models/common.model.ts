export type AppEnvironment = 'development' | 'test' | 'production';

export type RiskLevel = 'verde' | 'amarillo' | 'rojo' | 'critico';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

export interface MetricItem {
  label: string;
  value: string | number;
  helper?: string;
  tone?: BadgeVariant;
}
