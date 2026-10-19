import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtopicManagement } from './subtopic-management';

describe('SubtopicManagement', () => {
  let component: SubtopicManagement;
  let fixture: ComponentFixture<SubtopicManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtopicManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtopicManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
