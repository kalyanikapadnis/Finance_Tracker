import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Category {
  id: number;
  category: string;
  category_description: string;
}

export interface Transaction {
  id?: number;
  category: string;
  date: string;
  amount: number;
  transaction_desc: string;
  added_by?: number;
  updated_by?: number;
  added_by_user?: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface DashboardSummary {
  summary: {
    total_income: number;
    total_expenses: number;
    net_savings: number;
  };
  category_breakdown: {
    category: string;
    total_amount: number;
    transaction_count: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`)
      .pipe(catchError(this.handleError));
  }

  getTransactions(filters?: {
    category?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Observable<TransactionResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.start_date) params = params.set('start_date', filters.start_date);
      if (filters.end_date) params = params.set('end_date', filters.end_date);
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.offset) params = params.set('offset', filters.offset.toString());
    }

    return this.http.get<TransactionResponse>(`${this.apiUrl}/transactions`, { params })
      .pipe(catchError(this.handleError));
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions`, transaction, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<any> {
    return this.http.put(`${this.apiUrl}/transactions/${id}`, transaction, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/transactions/${id}`)
      .pipe(catchError(this.handleError));
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard/summary`)
      .pipe(catchError(this.handleError));
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Transaction Service Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check if the server is running.';
      } else {
        errorMessage = `Server error: ${error.status} ${error.statusText}`;
      }
    }
    
    return throwError(() => ({ error: { error: errorMessage } }));
  };
}