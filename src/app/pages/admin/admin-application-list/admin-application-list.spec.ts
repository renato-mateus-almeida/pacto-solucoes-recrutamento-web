import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminApplicationList } from './admin-application-list';

describe('AdminApplicationList', () => {
  let component: AdminApplicationList;
  let fixture: ComponentFixture<AdminApplicationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminApplicationList],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminApplicationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
