import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, scheduled, asyncScheduler } from 'rxjs';
import { AdminApplicationDetail } from './admin-application-detail';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationService } from '../../../core/services/application';
import { EvaluationService } from '../../../core/services/evaluation.service';

const asap = <T>(value: T) => scheduled(of(value), asyncScheduler);

const vacancy = { id: 1, title: 'Vacancy', description: null, requirements: [], status: 'OPEN' as const, createdBy: { id: 1, name: 'Admin' }, createdAt: '2025-01-01' };
const application = { id: 10, vacancy: { id: 1, title: 'Vacancy' }, candidate: { id: 1, name: 'John' }, status: 'PENDING' as const, appliedAt: '2025-01-01' };
const inReviewApp = { ...application, status: 'IN_REVIEW' as const };

describe('AdminApplicationDetail', () => {
  let component: AdminApplicationDetail;
  let fixture: ComponentFixture<AdminApplicationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminApplicationDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'vacancyId' ? '1' : key === 'id' ? '10' : null,
              },
            },
          },
        },
        { provide: VacancyService, useValue: { getById: () => asap(vacancy), listApplications: () => asap([application]) } },
        { provide: ApplicationService, useValue: { updateStatus: () => asap(inReviewApp) } },
        { provide: EvaluationService, useValue: { getByApplication: () => asap(null), create: () => asap(null) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminApplicationDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
