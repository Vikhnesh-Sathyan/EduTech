import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealWorldScenario } from './real-world-scenario';

describe('RealWorldScenario', () => {
  let component: RealWorldScenario;
  let fixture: ComponentFixture<RealWorldScenario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealWorldScenario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealWorldScenario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
