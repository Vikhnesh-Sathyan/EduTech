import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDoubts } from './my-doubts';

describe('MyDoubts', () => {
  let component: MyDoubts;
  let fixture: ComponentFixture<MyDoubts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyDoubts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyDoubts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
