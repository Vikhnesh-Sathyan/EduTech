import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementteamDashboardComponent } from './placementteam-dashboard.component';

describe('PlacementteamDashboardComponent', () => {
  let component: PlacementteamDashboardComponent;
  let fixture: ComponentFixture<PlacementteamDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlacementteamDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlacementteamDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
