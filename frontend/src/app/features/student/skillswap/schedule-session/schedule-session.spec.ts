import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleSession } from './schedule-session';

describe('ScheduleSession', () => {
  let component: ScheduleSession;
  let fixture: ComponentFixture<ScheduleSession>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleSession]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleSession);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
