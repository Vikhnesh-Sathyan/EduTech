import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionReport } from './discussion-report';

describe('DiscussionReport', () => {
  let component: DiscussionReport;
  let fixture: ComponentFixture<DiscussionReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscussionReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscussionReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
