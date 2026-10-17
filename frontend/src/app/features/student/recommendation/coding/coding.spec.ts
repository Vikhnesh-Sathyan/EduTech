
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingComponent } from './coding';

describe('CodingComponent', () => {
  let component: CodingComponent;
  let fixture: ComponentFixture<CodingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CodingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
