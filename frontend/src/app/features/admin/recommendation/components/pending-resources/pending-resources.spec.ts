import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingResources } from './pending-resources';

describe('PendingResources', () => {
  let component: PendingResources;
  let fixture: ComponentFixture<PendingResources>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingResources]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingResources);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
