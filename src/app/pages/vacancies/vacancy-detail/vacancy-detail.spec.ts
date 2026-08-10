import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, scheduled, asyncScheduler } from 'rxjs';
import { VacancyDetail } from './vacancy-detail';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationService } from '../../../core/services/application';

const asap = <T>(value: T) => scheduled(of(value), asyncScheduler);

describe('VacancyDetail', () => {
  let component: VacancyDetail;
  let fixture: ComponentFixture<VacancyDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'id' ? '1' : null,
              },
            },
          },
        },
        { provide: VacancyService, useValue: { getById: () => asap(null) } },
        { provide: ApplicationService, useValue: { listMy: () => asap([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VacancyDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
