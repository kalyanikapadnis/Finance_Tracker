import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RupeePipe } from '../../app/pipes/rupee.pipe';

@Component({
  selector: 'app-simple-charts',
  imports: [CommonModule, RupeePipe],
  templateUrl: './simple-charts.html',
  styleUrl: './simple-charts.css',
  standalone : true
})
export class SimpleCharts {
  @Input() pieChartData: any[] = [];
  @Input() totalIncome: number = 0;
  @Input() totalExpenses: number = 0;

  private colors = [
    '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', 
    '#10b981', '#ec4899', '#14b8a6', '#f97316'
  ];

  getColor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  getIncomeWidth(): string {
    if (!this.totalIncome && !this.totalExpenses) return '50%';
    const total = this.totalIncome + this.totalExpenses;
    if (total === 0) return '50%';
    return `${Math.max((this.totalIncome / total) * 100, 10)}%`;
  }

  getExpenseWidth(): string {
    if (!this.totalIncome && !this.totalExpenses) return '50%';
    const total = this.totalIncome + this.totalExpenses;
    if (total === 0) return '50%';
    return `${Math.max((this.totalExpenses / total) * 100, 10)}%`;
  }
}
