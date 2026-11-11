import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWalletTransactionsComponent } from './admin-wallet-transactions.component';

describe('AdminWalletTransactionsComponent', () => {
  let component: AdminWalletTransactionsComponent;
  let fixture: ComponentFixture<AdminWalletTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminWalletTransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminWalletTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
