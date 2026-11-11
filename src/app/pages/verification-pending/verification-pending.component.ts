import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-verification-pending',
  imports: [CommonModule, RouterModule],
  templateUrl: './verification-pending.component.html',
  styleUrl: './verification-pending.component.scss'
})
export class VerificationPendingComponent implements OnInit{

  userEmail: string = '';
  faqOpen: boolean[] = [false, false, false];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Récupérer l'email de l'utilisateur depuis le state ou localStorage
    const state = history.state;
    this.userEmail = state?.email || localStorage.getItem('pendingVerificationEmail') || '';
  }

  goToDashboard(): void {
    this.router.navigate(['/seller/verification-status']);
  }

  contactSupport(): void {
    
    window.location.href = '/contact-us';
  }

  resendEmail(): void {
    // Logique pour renvoyer l'email de confirmation
    console.log('Email renvoyé à', this.userEmail);
    // Afficher une notification
  }

  toggleFaq(index: number): void {
    this.faqOpen[index] = !this.faqOpen[index];
  }
}
