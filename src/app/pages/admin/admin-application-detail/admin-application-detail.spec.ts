import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminApplicationDetail } from './admin-application-detail';

describe('AdminApplicationDetail', () => {
  let component: AdminApplicationDetail;
  let fixture: ComponentFixture<AdminApplicationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminApplicationDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminApplicationDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
