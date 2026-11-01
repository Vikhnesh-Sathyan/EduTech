import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaseCreate } from './test-case-create';

describe('TestCaseCreate', () => {
  let component: TestCaseCreate;
  let fixture: ComponentFixture<TestCaseCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestCaseCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
