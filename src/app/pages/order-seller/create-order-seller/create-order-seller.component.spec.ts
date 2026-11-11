import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrderSellerComponent } from './create-order-seller.component';

describe('CreateOrderSellerComponent', () => {
  let component: CreateOrderSellerComponent;
  let fixture: ComponentFixture<CreateOrderSellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrderSellerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrderSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
