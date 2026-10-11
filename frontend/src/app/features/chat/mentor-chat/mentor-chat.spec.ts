import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorChat } from './mentor-chat';

describe('MentorChat', () => {
  let component: MentorChat;
  let fixture: ComponentFixture<MentorChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorChat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
