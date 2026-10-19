import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologyManagement } from './technology-management';

describe('TechnologyManagement', () => {
  let component: TechnologyManagement;
  let fixture: ComponentFixture<TechnologyManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologyManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnologyManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
