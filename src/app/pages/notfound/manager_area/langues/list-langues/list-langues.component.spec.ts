import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListLanguesComponent } from './list-langues.component';

describe('ListLanguesComponent', () => {
  let component: ListLanguesComponent;
  let fixture: ComponentFixture<ListLanguesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListLanguesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListLanguesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
