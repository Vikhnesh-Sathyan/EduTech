import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionContent } from './section-content';

describe('SectionContent', () => {
  let component: SectionContent;
  let fixture: ComponentFixture<SectionContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
