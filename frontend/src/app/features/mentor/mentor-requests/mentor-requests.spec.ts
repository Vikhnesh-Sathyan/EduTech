import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorRequests } from './mentor-requests';

describe('MentorRequests', () => {
  let component: MentorRequests;
  let fixture: ComponentFixture<MentorRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
