import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminVacancyForm } from './admin-vacancy-form';

describe('AdminVacancyForm', () => {
  let component: AdminVacancyForm;
  let fixture: ComponentFixture<AdminVacancyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminVacancyForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminVacancyForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
