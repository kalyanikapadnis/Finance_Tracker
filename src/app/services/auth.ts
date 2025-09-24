import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from "@angular/common/http";
import { catchError, Observable, tap, throwError } from "rxjs";



export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export interface RegisterResponse {
  message: string;
}

@Injectable ({
    providedIn : 'root'
})

export class AuthService{

    private readonly http = inject(HttpClient)
    private readonly apiUrl = 'http://localhost:5000';
    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    login(credentials : LoginCredentials) : Observable<LoginResponse>{
        console.log("In service login");
        return this.http.post<LoginResponse>(
            `${this.apiUrl}/login`,
            credentials,
            this.httpOptions
        ).pipe(
            tap(response => {
                console.log('Login Response :'+response)
                if(response.token){
                    this.setToken(response.token);
                    this.setUser(response.user)
                }
            }),
            catchError(this.handleError)
        );
    }

    getToken(): string | null {
        if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
        }
        return null;
    }

    getUser(): any {
        if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
        }
        return null;
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    private setToken(token: string): void {
        if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        }
    }

    private setUser(user: any): void {
        if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
        }
    }

    private clearStorage(): void {
        if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        }
    }

    logout(): void {
        this.clearStorage();
    }
    
    private handleError = (error: HttpErrorResponse): Observable<never> => {
        console.error('HTTP Error:', error);
        
        let errorMessage = 'An unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
            // Client-side error
        errorMessage = error.error.message;
        } else {
            // Server-side error
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

register(credentials: RegisterCredentials): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`, 
      credentials, 
      this.httpOptions
    ).pipe(
      tap(response => console.log('Register response:', response)),
      catchError(this.handleError)
    );
  }
}



