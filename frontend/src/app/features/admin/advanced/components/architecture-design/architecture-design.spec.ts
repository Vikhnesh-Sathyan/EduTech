import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchitectureDesign } from './architecture-design';

describe('ArchitectureDesign', () => {
  let component: ArchitectureDesign;
  let fixture: ComponentFixture<ArchitectureDesign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchitectureDesign]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchitectureDesign);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
