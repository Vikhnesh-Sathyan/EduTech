import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSubtopics } from './admin-subtopics';

describe('AdminSubtopics', () => {
  let component: AdminSubtopics;
  let fixture: ComponentFixture<AdminSubtopics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSubtopics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSubtopics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
