import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformOverview } from './platform-overview';

describe('PlatformOverview', () => {
  let component: PlatformOverview;
  let fixture: ComponentFixture<PlatformOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlatformOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
