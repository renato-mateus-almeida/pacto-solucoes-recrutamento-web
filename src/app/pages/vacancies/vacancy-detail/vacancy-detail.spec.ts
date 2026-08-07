import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { VacancyDetail } from './vacancy-detail';

describe('VacancyDetail', () => {
  let component: VacancyDetail;
  let fixture: ComponentFixture<VacancyDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyDetail],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(VacancyDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
