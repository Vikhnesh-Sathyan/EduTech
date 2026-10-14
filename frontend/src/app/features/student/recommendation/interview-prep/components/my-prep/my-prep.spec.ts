import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPrep } from './my-prep';

describe('MyPrep', () => {
  let component: MyPrep;
  let fixture: ComponentFixture<MyPrep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPrep]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPrep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
