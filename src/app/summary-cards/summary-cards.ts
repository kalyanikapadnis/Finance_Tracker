import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RupeePipe } from '../pipes/rupee.pipe';

export interface DashboardSummary {
  summary: {
    total_income: number;
    total_expenses: number;
    net_savings: number;
  };
  category_breakdown: any[];
}

@Component({
  selector: 'app-summary-cards',
  imports: [CommonModule, RupeePipe],
  templateUrl: './summary-cards.html',
  styleUrl: './summary-cards.css',
  standalone: true
})
export class SummaryCardsComponent {
  @Input() dashboardSummary: DashboardSummary | null = null;

  // Get methods with null safety
  getTotalIncome(): number {
    return this.dashboardSummary?.summary.total_income || 0;
  }

  getTotalExpenses(): number {
    return this.dashboardSummary?.summary.total_expenses || 0;
  }

  getNetSavings(): number {
    return this.dashboardSummary?.summary.net_savings || 0;
  }

  // Calculate percentage changes (mock data for now)
  getIncomeChange(): { percentage: number; isPositive: boolean } {
    // You can implement actual percentage calculation here
    return { percentage: 12.5, isPositive: true };
  }

  getExpenseChange(): { percentage: number; isPositive: boolean } {
    return { percentage: 8.2, isPositive: false };
  }

  getSavingsChange(): { percentage: number; isPositive: boolean } {
    return { percentage: 18.9, isPositive: true };
  }
}