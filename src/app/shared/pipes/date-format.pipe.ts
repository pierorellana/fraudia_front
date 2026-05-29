import { Pipe, PipeTransform } from '@angular/core';
import { formatDateValue, DateDisplayFormat } from '../utils/format.util';

@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: DateDisplayFormat = 'short'): string {
    return formatDateValue(value, format);
  }
}
