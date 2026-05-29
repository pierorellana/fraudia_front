export type DateDisplayFormat = 'short' | 'long' | 'full' | 'time';

export function formatCurrencyValue(value: number | string | null | undefined): string {
  const numericValue = typeof value === 'string' ? Number(value) : value;

  if (numericValue === null || numericValue === undefined || Number.isNaN(numericValue)) {
    return '$0';
  }

  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatDateValue(value: string | Date | null | undefined, format: DateDisplayFormat = 'short'): string {
  if (!value) {
    return '-';
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const optionsByFormat: Record<DateDisplayFormat, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    time: { hour: '2-digit', minute: '2-digit' },
  };

  return new Intl.DateTimeFormat('es-EC', optionsByFormat[format]).format(date);
}

export function formatNumberValue(value: number | null | undefined, decimals = 0): string {
  return new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value ?? 0);
}

export function truncateText(text: string | null | undefined, length = 80): string {
  if (!text) {
    return '-';
  }

  return text.length <= length ? text : `${text.slice(0, length)}...`;
}
