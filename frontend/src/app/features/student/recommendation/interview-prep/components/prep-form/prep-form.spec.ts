import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepForm } from './prep-form';

describe('PrepForm', () => {
  let component: PrepForm;
  let fixture: ComponentFixture<PrepForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrepForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrepForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
