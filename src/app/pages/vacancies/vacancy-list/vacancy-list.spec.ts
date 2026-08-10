import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, scheduled, asyncScheduler } from 'rxjs';
import { VacancyList } from './vacancy-list';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationService } from '../../../core/services/application';

const asap = <T>(value: T) => scheduled(of(value), asyncScheduler);

describe('VacancyList', () => {
  let component: VacancyList;
  let fixture: ComponentFixture<VacancyList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyList],
      providers: [
        provideRouter([]),
        { provide: VacancyService, useValue: { list: () => asap([]) } },
        { provide: ApplicationService, useValue: { listMy: () => asap([]), apply: () => asap({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VacancyList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
