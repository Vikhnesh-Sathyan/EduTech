import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorCheatsheet } from './mentor-cheatsheet';

describe('MentorCheatsheet', () => {
  let component: MentorCheatsheet;
  let fixture: ComponentFixture<MentorCheatsheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorCheatsheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorCheatsheet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
