import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSections } from './project-sections';

describe('ProjectSections', () => {
  let component: ProjectSections;
  let fixture: ComponentFixture<ProjectSections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectSections]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectSections);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
