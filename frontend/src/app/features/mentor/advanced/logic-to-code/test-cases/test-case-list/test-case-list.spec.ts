import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaseList } from './test-case-list';

describe('TestCaseList', () => {
  let component: TestCaseList;
  let fixture: ComponentFixture<TestCaseList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestCaseList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
