import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionCreate } from './solution-create';

describe('SolutionCreate', () => {
  let component: SolutionCreate;
  let fixture: ComponentFixture<SolutionCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolutionCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolutionCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
