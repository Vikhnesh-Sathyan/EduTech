import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorInbox } from './mentor-inbox';

describe('MentorInbox', () => {
  let component: MentorInbox;
  let fixture: ComponentFixture<MentorInbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorInbox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorInbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
