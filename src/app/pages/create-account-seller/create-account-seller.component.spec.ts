import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccountSellerComponent } from './create-account-seller.component';

describe('CreateAccountSellerComponent', () => {
  let component: CreateAccountSellerComponent;
  let fixture: ComponentFixture<CreateAccountSellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAccountSellerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAccountSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
