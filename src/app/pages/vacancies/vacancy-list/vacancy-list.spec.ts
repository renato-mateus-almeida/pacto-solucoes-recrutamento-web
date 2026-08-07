import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { VacancyList } from './vacancy-list';

describe('VacancyList', () => {
  let component: VacancyList;
  let fixture: ComponentFixture<VacancyList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyList],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(VacancyList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
