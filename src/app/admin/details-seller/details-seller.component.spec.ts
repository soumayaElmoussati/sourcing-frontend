import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsSellerComponent } from './details-seller.component';

describe('DetailsSellerComponent', () => {
  let component: DetailsSellerComponent;
  let fixture: ComponentFixture<DetailsSellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsSellerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
