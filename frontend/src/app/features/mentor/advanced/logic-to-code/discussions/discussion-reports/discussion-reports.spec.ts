import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionReports } from './discussion-reports';

describe('DiscussionReports', () => {
  let component: DiscussionReports;
  let fixture: ComponentFixture<DiscussionReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscussionReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscussionReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
