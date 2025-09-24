import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginCredentials, RegisterCredentials } from '../services/auth'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone:true
})


export class LoginComponent {
 
  constructor() {
    try {
      this.authService = inject(AuthService);
      console.log('AuthService injected successfully:', this.authService);
    } catch (error) {
      console.error('Failed to inject AuthService:', error);
    }
  }

  private readonly authService = inject(AuthService);
  //private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  isLoading = signal(false);
  message = signal('');
  errorMessage = signal('');
  isRegisterMode = signal(false);
  connectionStatus = signal('Unknown');

  credentials: LoginCredentials & RegisterCredentials = {
    username: '',
    password: ''
  };

  onLogin(): void {
    console.log('=== LOGIN DEBUG ===');
    console.log('onLogin method entered');
    console.log('AuthService method exists:', typeof this.authService.login);
    if (!this.authService) {
      console.error('AuthService is null/undefined');
      return;
    }
    console.log("In login function");
    if(!this.credentials.username || !this.credentials.password){
      this.setError('Please fill in all fields');
      return;
    }

    this.setLoading(true);
    this.clearMessages();

    this.authService.login(this.credentials).subscribe({
      next:(response) => {
        console.log("Login Successful:",response)
        this.setSuccess(response.message);
        this.setLoading(false);

        setTimeout(() => {
          //this.router.navigate(['dashboard'])
          window.location.href = '/dashboard';
        }, 1500)
      },
      error:(error) => {
        console.log("Login Error :", error);
        this.setError(error.error?.error || 'Login failed. Please try again.');
        this.setLoading(false);
      }
    })
  }

onRegister(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.setError('Please fill in all fields');
      return;
    }

    if (this.credentials.password.length < 6) {
      this.setError('Password must be at least 6 characters long');
      return;
    }

    this.setLoading(true);
    this.clearMessages();

    const registerData: RegisterCredentials = {
      username: this.credentials.username,
      password: this.credentials.password,
      role: 'user' // Default role
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.setSuccess(response.message + ' You can now login.');
        this.setLoading(false);
        
        // Auto-switch to login mode after successful registration
        setTimeout(() => {
          this.isRegisterMode.set(false);
          this.clearMessages();
        }, 2000);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.setError(error.error?.error || 'Registration failed. Please try again.');
        this.setLoading(false);
      }
    });
  }


  toggleMode(): void {
    this.isRegisterMode.set(!this.isRegisterMode());
    this.clearMessages();
    this.resetForm();
  }

  private setSuccess(message: string): void {
    this.message.set(message);
    this.errorMessage.set('');
  }

   private resetForm(): void {
    this.credentials = {
      username: '',
      password: ''
    };
  }

  setError(message:string):void{
    this.errorMessage.set(message);
    this.message.set('');
  }

  private setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  private clearMessages(): void {
    this.message.set('');
    this.errorMessage.set('');
  }

}
