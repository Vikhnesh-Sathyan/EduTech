import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionDelete } from './discussion-delete';

describe('DiscussionDelete', () => {
  let component: DiscussionDelete;
  let fixture: ComponentFixture<DiscussionDelete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscussionDelete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscussionDelete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
