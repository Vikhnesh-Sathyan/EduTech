import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaseEdit } from './test-case-edit';

describe('TestCaseEdit', () => {
  let component: TestCaseEdit;
  let fixture: ComponentFixture<TestCaseEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestCaseEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
