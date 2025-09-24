import { Component, signal, inject} from '@angular/core';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone:true
})
export class Header {

    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    currentUser = signal(this.authService.getUser());

    logout() {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
}
