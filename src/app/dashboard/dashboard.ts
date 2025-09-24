import { Component, OnInit, signal, inject, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService, Transaction, Category, DashboardSummary } from '../services/transaction';
import { AuthService } from '../services/auth';
import { SummaryCardsComponent } from '../summary-cards/summary-cards';
import { SimpleCharts } from '../simple-charts/simple-charts';

interface TransactionForm {
  category: string;
  date: string;
  amount: number;
  transaction_desc: string;
  transactionType: string; // Add this property
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SummaryCardsComponent, SimpleCharts],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  // Signals for Angular 20
  categories = signal<Category[]>([]);
  transactions = signal<Transaction[]>([]);
  dashboardSummary = signal<DashboardSummary | null>(null);
  isLoading = signal(false);
  message = signal('');
  errorMessage = signal('');
  currentUser = signal(this.authService.getUser());
  showAddTransactionModal = signal(false);
  editingTransactionId = signal<number | null>(null);
  editTransactionForm: Transaction = {} as Transaction;
  isDarkMode = signal(false);
  showBudgetModal = signal(false);
  newBudget = {
    category: '',
    amount: 0,
    month: new Date().toISOString().slice(0, 7) // YYYY-MM format
  };
  searchTerm = signal('');

  // Form data
  newTransaction: TransactionForm = {
    category: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    transaction_desc: '',
    transactionType: ''
  };

  // Filters
  filters = {
    category: 'All Categories',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  };
 
  // Sample budget goals (you can make these dynamic later)
  budgetGoals = [
    { category: 'Food & Dining', spent: 450, budget: 600, color: '#ef4444' },
    { category: 'Transportation', spent: 280, budget: 300, color: '#3b82f6' },
    { category: 'Entertainment', spent: 220, budget: 200, color: '#8b5cf6' },
    { category: 'Utilities', spent: 120, budget: 250, color: '#f59e0b' }
  ];
  

  ngAfterViewInit() {
    // Small delay to ensure canvas elements are rendered
    setTimeout(() => {
      
    }, 100);
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load dark mode preference (browser check)
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme === 'true') {
        this.isDarkMode.set(true);
        this.applyDarkMode();
      }
    }

    this.loadCategories();
    this.loadTransactions();
    this.loadDashboardSummary();
  }

  loadCategories() {
    this.transactionService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadTransactions() {
    const filterParams = {
      category: this.filters.category !== 'All Categories' ? this.filters.category : undefined,
      start_date: this.filters.dateFrom || undefined,
      end_date: this.filters.dateTo || undefined,
      limit: 50
    };

    this.transactionService.getTransactions(filterParams).subscribe({
      next: (response) => {
        this.transactions.set(response.transactions);
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

loadDashboardSummary() {
    this.transactionService.getDashboardSummary().subscribe({
      next: (summary) => {
        this.dashboardSummary.set(summary);
      },
      error: (error) => {
        console.error('Error loading dashboard summary:', error);
      }
    });
  }

  addTransaction() {
    if (!this.newTransaction.category || !this.newTransaction.date || this.newTransaction.amount <= 0 || !this.newTransaction.transactionType) {
      this.setError('Please fill in all required fields');
      return;
    }

    this.isLoading.set(true);
    this.clearMessages();

      // Convert amount based on type
      const finalAmount = this.newTransaction.transactionType === 'debit' 
        ? -Math.abs(this.newTransaction.amount) 
        : Math.abs(this.newTransaction.amount);

      const transactionData: Omit<Transaction, 'id'> = {
        category: this.newTransaction.category,
        date: this.newTransaction.date,
        amount: finalAmount,
        transaction_desc: this.newTransaction.transaction_desc,
        added_by: this.currentUser()?.id || 1
      };


    this.transactionService.addTransaction(transactionData).subscribe({
      next: (response) => {
        this.setSuccess('Transaction added successfully!');
        this.resetForm();
        this.showAddTransactionModal.set(false);
        this.loadTransactions();
        this.loadDashboardSummary();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.setError('Failed to add transaction: ' + error.error?.error);
        this.isLoading.set(false);
      }
    });
  }

  editTransaction(transaction: Transaction) {
    this.editingTransactionId.set(transaction.id!);
    this.editTransactionForm = {
      ...transaction,
      date: transaction.date // Ensure date is in correct format
    };
    console.log('Editing transaction:', this.editTransactionForm);
  }

  saveEditTransaction() {
    if (!this.editTransactionForm.id) return;

    const updateData = {
      category: this.editTransactionForm.category,
      date: this.editTransactionForm.date,
      amount: this.editTransactionForm.amount,
      transaction_desc: this.editTransactionForm.transaction_desc,
      updated_by: this.currentUser()?.id || 1
    };

    this.transactionService.updateTransaction(this.editTransactionForm.id, updateData).subscribe({
      next: (response) => {
        this.setSuccess('Transaction updated successfully!');
        this.cancelEdit();
        this.loadTransactions();
        this.loadDashboardSummary();
      },
      error: (error) => {
        this.setError('Failed to update transaction: ' + error.error?.error);
      }
    });
  }

  cancelEdit() {
    this.editingTransactionId.set(null);
    this.editTransactionForm = {} as Transaction;
  }

  deleteTransaction(id: number) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    this.transactionService.deleteTransaction(id).subscribe({
      next: (response) => {
        this.setSuccess('Transaction deleted successfully!');
        this.loadTransactions();
        this.loadDashboardSummary();
      },
      error: (error) => {
        this.setError('Failed to delete transaction: ' + error.error?.error);
      }
    });
  }

  applyFilters() {
    this.loadTransactions();
  }

  clearFilters() {
    this.filters = {
      category: 'All Categories',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    };
    this.loadTransactions();
  }

  openAddTransactionModal() {
    this.showAddTransactionModal.set(true);
    this.clearMessages();
  }

  closeAddTransactionModal() {
    this.showAddTransactionModal.set(false);
    this.resetForm();
    this.clearMessages();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getBudgetPercentage(goal: any): number {
    return Math.min((goal.spent / goal.budget) * 100, 100);
  }

  getBudgetStatus(goal: any): string {
    const percentage = this.getBudgetPercentage(goal);
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'safe';
  }

  private resetForm() {
    this.newTransaction = {
      category: '',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      transaction_desc: '',
      transactionType: ''
    };
  }

  private setSuccess(message: string) {
    this.message.set(message);
    this.errorMessage.set('');
    setTimeout(() => this.clearMessages(), 3000);
  }

  private setError(message: string) {
    this.errorMessage.set(message);
    this.message.set('');
    setTimeout(() => this.clearMessages(), 5000);
  }

  private clearMessages() {
    this.message.set('');
    this.errorMessage.set('');
  }

  
  getTotalIncome(): number {
    return this.dashboardSummary()?.summary.total_income || 5240;
  }

  getTotalExpenses(): number {
    return this.dashboardSummary()?.summary.total_expenses || 3890;
  }

  getNetSavings(): number {
    return this.dashboardSummary()?.summary.net_savings || 1350;
  }

  // Add this method to your dashboard.component.ts

  exportData() {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Get current date for filename
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Prepare data for export
    const exportData = {
      summary: this.dashboardSummary(),
      transactions: this.transactions(),
      categories: this.categories(),
      exportDate: currentDate,
      totalTransactions: this.transactions().length
    };

    // Create CSV format
    const csvData = this.convertToCSV(this.transactions());
    
    // Create and download CSV file
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-tracker-${currentDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Also create JSON export option
    this.exportJSON(exportData, currentDate);
    
    this.setSuccess('Data exported successfully!');
  }

  private convertToCSV(transactions: Transaction[]): string {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Added By'];
    const csvRows = [headers.join(',')];

    transactions.forEach(transaction => {
      const row = [
        transaction.date,
        `"${transaction.category}"`,
        `"${transaction.transaction_desc || ''}"`,
        transaction.amount,
        transaction.added_by_user || 'Unknown'
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private exportJSON(data: any, date: string) {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
  
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-tracker-${date}.json`;
    
    // Auto-download JSON after a small delay
    setTimeout(() => {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 500);
  }
  
  searchTransactions() {
    const term = this.searchTerm().toLowerCase();
    if (term) {
      const filtered = this.transactions().filter(t => 
        t.category.toLowerCase().includes(term) ||
        (t.transaction_desc || '').toLowerCase().includes(term)
      );
      this.transactions.set(filtered);
    } else {
      this.loadTransactions(); // Reload all transactions
    }
  }

  toggleDarkMode() {
    
    const currentMode = this.isDarkMode();
    this.isDarkMode.set(!currentMode);
    console.log("In dark mode function"+currentMode)
    // Save preference to localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('darkMode', (!currentMode).toString());
    }    
    
    if (!currentMode) {
      this.applyDarkMode();
    } else {
      this.removeDarkMode();
    }
  }

  private applyDarkMode() {
    console.log("In apply dark mode function")
    document.documentElement.classList.add('dark-theme');
    document.body.classList.add('dark-theme');
  }

  private removeDarkMode() {
    document.documentElement.classList.remove('dark-theme');
    document.body.classList.remove('dark-theme');
  }

  openBudgetModal() {
    this.showBudgetModal.set(true);
    this.clearMessages();
  }

  closeBudgetModal() {
    this.showBudgetModal.set(false);
    this.resetBudgetForm();
    this.clearMessages();
  }

  setBudgetGoal() {
    if (!this.newBudget.category || this.newBudget.amount <= 0) {
      this.setError('Please select a category and enter a valid amount');
      return;
    }

    // Find existing budget goal and update it
    const existingIndex = this.budgetGoals.findIndex(goal => goal.category === this.newBudget.category);
    
    if (existingIndex >= 0) {
      // Update existing budget
      this.budgetGoals[existingIndex].budget = this.newBudget.amount;
      this.setSuccess(`Budget updated for ${this.newBudget.category}: ₹${this.newBudget.amount}`);
    } else {
      // Add new budget goal
      const colors = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      this.budgetGoals.push({
        category: this.newBudget.category,
        spent: 0, // Will be calculated from actual transactions
        budget: this.newBudget.amount,
        color: randomColor
      });
      
      this.setSuccess(`New budget goal set for ${this.newBudget.category}: ₹${this.newBudget.amount}`);
    }
    
    this.closeBudgetModal();
    this.calculateBudgetSpending(); // Recalculate spending for this category
  }

  // Method to calculate actual spending for budget categories
  calculateBudgetSpending() {
    this.budgetGoals.forEach(goal => {
      const categoryTransactions = this.transactions().filter(t => 
        t.category === goal.category && t.amount < 0
      );
      
      goal.spent = categoryTransactions.reduce((total, t) => total + Math.abs(t.amount), 0);
    });
  }

  private resetBudgetForm() {
    this.newBudget = {
      category: '',
      amount: 0,
      month: new Date().toISOString().slice(0, 7)
    };
  }
}