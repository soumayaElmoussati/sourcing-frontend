import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourcingRequestComponent } from './sourcing-request.component';

describe('SourcingRequestComponent', () => {
  let component: SourcingRequestComponent;
  let fixture: ComponentFixture<SourcingRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourcingRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourcingRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
