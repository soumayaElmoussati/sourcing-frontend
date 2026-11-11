import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface FeeDTO {
  id: number;
  type: 'LEAD_FEE' | 'DELIVERED_FEE' | 'RETURNED_FEE';
  amount: number;
  updatedAt: string;
}

@Component({
  selector: 'app-seller-fees',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './seller-fees.component.html',
  styleUrls: ['./seller-fees.component.scss']
})
export class SellerFeesComponent implements OnInit {

  fees: FeeDTO[] = [];
  isLoading = true;
  error = '';

  readonly WITHDRAWAL_FEE_PERCENT = 2;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadFees(); }

  loadFees() {
    this.isLoading = true;
    this.http.get<FeeDTO[]>(`${environment.apiUrl}/api/seller/fees`).subscribe({
      next: data => { this.fees = data; this.isLoading = false; },
      error: () => { this.error = 'Impossible de charger les frais.'; this.isLoading = false; }
    });
  }

  /** Retourne le fee d'un type donné, ou null si pas configuré */
  getFee(type: string): FeeDTO | null {
    return this.fees.find(f => f.type === type) ?? null;
  }

  getFeeDot(type: string): string {
    const f = this.getFee(type);
    return f ? 'pf-blue' : 'pf-slate';
  }
}