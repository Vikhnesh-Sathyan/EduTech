import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskDoubt } from './ask-doubt';

describe('AskDoubt', () => {
  let component: AskDoubt;
  let fixture: ComponentFixture<AskDoubt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskDoubt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AskDoubt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
