import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorVerification } from './mentor-verification';

describe('MentorVerification', () => {
  let component: MentorVerification;
  let fixture: ComponentFixture<MentorVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorVerification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorVerification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
