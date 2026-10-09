import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSectionContent } from './project-section-content';

describe('ProjectSectionContent', () => {
  let component: ProjectSectionContent;
  let fixture: ComponentFixture<ProjectSectionContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectSectionContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectSectionContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
