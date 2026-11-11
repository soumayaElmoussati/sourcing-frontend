import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLanguesComponent } from './form-langues.component';

describe('FormLanguesComponent', () => {
  let component: FormLanguesComponent;
  let fixture: ComponentFixture<FormLanguesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLanguesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormLanguesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
