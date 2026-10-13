import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Doubts } from './doubts';

describe('Doubts', () => {
  let component: Doubts;
  let fixture: ComponentFixture<Doubts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Doubts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Doubts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
