import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTopicLearning } from './admin-topic-learning';

describe('AdminTopicLearning', () => {
  let component: AdminTopicLearning;
  let fixture: ComponentFixture<AdminTopicLearning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTopicLearning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTopicLearning);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
