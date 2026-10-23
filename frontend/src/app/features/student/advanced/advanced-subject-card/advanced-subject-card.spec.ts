import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSubjectCard } from './advanced-subject-card';

describe('AdvancedSubjectCard', () => {
  let component: AdvancedSubjectCard;
  let fixture: ComponentFixture<AdvancedSubjectCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedSubjectCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedSubjectCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
