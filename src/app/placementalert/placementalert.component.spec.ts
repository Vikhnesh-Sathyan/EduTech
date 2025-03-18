import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementalertComponent } from './placementalert.component';

describe('PlacementalertComponent', () => {
  let component: PlacementalertComponent;
  let fixture: ComponentFixture<PlacementalertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlacementalertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlacementalertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
