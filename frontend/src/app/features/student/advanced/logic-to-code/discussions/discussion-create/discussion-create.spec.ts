import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionCreate } from './discussion-create';

describe('DiscussionCreate', () => {
  let component: DiscussionCreate;
  let fixture: ComponentFixture<DiscussionCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscussionCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscussionCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
