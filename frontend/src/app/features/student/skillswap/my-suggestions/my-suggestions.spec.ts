import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySuggestions } from './my-suggestions';

describe('MySuggestions', () => {
  let component: MySuggestions;
  let fixture: ComponentFixture<MySuggestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySuggestions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MySuggestions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
