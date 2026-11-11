import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListProductSellerComponent } from './list-product-seller.component';

describe('ListProductSellerComponent', () => {
  let component: ListProductSellerComponent;
  let fixture: ComponentFixture<ListProductSellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListProductSellerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListProductSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
