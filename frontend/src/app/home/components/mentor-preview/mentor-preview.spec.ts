import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorPreview } from './mentor-preview';

describe('MentorPreview', () => {
  let component: MentorPreview;
  let fixture: ComponentFixture<MentorPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
