import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentFocus } from './current-focus';

describe('CurrentFocus', () => {
  let component: CurrentFocus;
  let fixture: ComponentFixture<CurrentFocus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentFocus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentFocus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
