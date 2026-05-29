import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrencyValue } from '../utils/format.util';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    return formatCurrencyValue(value);
  }
}
