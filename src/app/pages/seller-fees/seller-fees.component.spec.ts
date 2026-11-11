import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerFeesComponent } from './seller-fees.component';

describe('SellerFeesComponent', () => {
  let component: SellerFeesComponent;
  let fixture: ComponentFixture<SellerFeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerFeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
