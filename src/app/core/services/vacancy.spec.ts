import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { VacancyService } from './vacancy';

describe('VacancyService', () => {
  let service: VacancyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(VacancyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
