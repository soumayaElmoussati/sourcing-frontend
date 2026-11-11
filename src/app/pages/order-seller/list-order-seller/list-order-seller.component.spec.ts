import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOrderSellerComponent } from './list-order-seller.component';

describe('ListOrderSellerComponent', () => {
  let component: ListOrderSellerComponent;
  let fixture: ComponentFixture<ListOrderSellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOrderSellerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOrderSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
