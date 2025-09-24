// Create src/app/pipes/rupee.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rupee',
  standalone: true
})
export class RupeePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '₹0.00';
    }
    
    // Format number with commas and 2 decimal places
    const formatted = Math.abs(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // Add negative sign if needed
    const sign = value < 0 ? '-' : '';
    
    return `${sign}₹${formatted}`;
  }
}