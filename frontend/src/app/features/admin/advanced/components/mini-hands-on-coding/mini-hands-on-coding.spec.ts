import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniHandsOnCoding } from './mini-hands-on-coding';

describe('MiniHandsOnCoding', () => {
  let component: MiniHandsOnCoding;
  let fixture: ComponentFixture<MiniHandsOnCoding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniHandsOnCoding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniHandsOnCoding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
