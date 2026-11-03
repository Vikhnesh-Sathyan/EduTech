import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionEdit } from './discussion-edit';

describe('DiscussionEdit', () => {
  let component: DiscussionEdit;
  let fixture: ComponentFixture<DiscussionEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscussionEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscussionEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
