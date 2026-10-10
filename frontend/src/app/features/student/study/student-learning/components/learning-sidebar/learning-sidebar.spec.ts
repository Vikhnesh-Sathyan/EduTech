import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningSidebar } from './learning-sidebar';

describe('LearningSidebar', () => {
  let component: LearningSidebar;
  let fixture: ComponentFixture<LearningSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
