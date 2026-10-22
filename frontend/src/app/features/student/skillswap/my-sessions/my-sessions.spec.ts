import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySessions } from './my-sessions';

describe('MySessions', () => {
  let component: MySessions;
  let fixture: ComponentFixture<MySessions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySessions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MySessions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
