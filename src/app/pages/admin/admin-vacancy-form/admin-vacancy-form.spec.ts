import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AdminVacancyForm } from './admin-vacancy-form';
import { VacancyService } from '../../../core/services/vacancy';

describe('AdminVacancyForm', () => {
  let component: AdminVacancyForm;
  let fixture: ComponentFixture<AdminVacancyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminVacancyForm],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
        { provide: VacancyService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminVacancyForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
