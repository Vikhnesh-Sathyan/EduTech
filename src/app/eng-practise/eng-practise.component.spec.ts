import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngPractiseComponent } from './eng-practise.component';

describe('EngPractiseComponent', () => {
  let component: EngPractiseComponent;
  let fixture: ComponentFixture<EngPractiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EngPractiseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngPractiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
