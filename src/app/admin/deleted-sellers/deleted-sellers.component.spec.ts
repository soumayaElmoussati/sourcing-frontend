import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedSellersComponent } from './deleted-sellers.component';

describe('DeletedSellersComponent', () => {
  let component: DeletedSellersComponent;
  let fixture: ComponentFixture<DeletedSellersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedSellersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedSellersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
