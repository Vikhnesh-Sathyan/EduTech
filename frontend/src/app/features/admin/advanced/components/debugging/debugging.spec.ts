import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Debugging } from './debugging';

describe('Debugging', () => {
  let component: Debugging;
  let fixture: ComponentFixture<Debugging>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Debugging]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Debugging);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
