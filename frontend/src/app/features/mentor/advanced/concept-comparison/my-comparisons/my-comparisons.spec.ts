import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyComparisons } from './my-comparisons';

describe('MyComparisons', () => {
  let component: MyComparisons;
  let fixture: ComponentFixture<MyComparisons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComparisons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyComparisons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
