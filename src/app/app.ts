import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header'
import { SummaryCards } from './summary-cards/summary-cards';
import { FinancialOverview } from './financial-overview/financial-overview';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, SummaryCards, FinancialOverview],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App {
  protected readonly title = signal('FinanceTracker');
}
