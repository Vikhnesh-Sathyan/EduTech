import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coding } from './coding';

describe('Coding', () => {
  let component: Coding;
  let fixture: ComponentFixture<Coding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
