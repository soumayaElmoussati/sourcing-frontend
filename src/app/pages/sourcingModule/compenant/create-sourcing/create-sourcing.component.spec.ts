import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSourcingComponent } from './create-sourcing.component';

describe('CreateSourcingComponent', () => {
  let component: CreateSourcingComponent;
  let fixture: ComponentFixture<CreateSourcingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSourcingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSourcingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
