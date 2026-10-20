import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtopicDetail } from './subtopic-detail';

describe('SubtopicDetail', () => {
  let component: SubtopicDetail;
  let fixture: ComponentFixture<SubtopicDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtopicDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtopicDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
