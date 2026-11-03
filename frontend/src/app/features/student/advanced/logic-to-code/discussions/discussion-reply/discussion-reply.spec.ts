import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionReply } from './discussion-reply';

describe('DiscussionReply', () => {
  let component: DiscussionReply;
  let fixture: ComponentFixture<DiscussionReply>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscussionReply]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscussionReply);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
