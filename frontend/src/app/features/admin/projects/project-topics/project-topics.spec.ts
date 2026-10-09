import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTopics } from './project-topics';

describe('ProjectTopics', () => {
  let component: ProjectTopics;
  let fixture: ComponentFixture<ProjectTopics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTopics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTopics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
