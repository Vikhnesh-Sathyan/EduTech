import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementTeamComponent } from './placement-team.component';

describe('PlacementTeamComponent', () => {
  let component: PlacementTeamComponent;
  let fixture: ComponentFixture<PlacementTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlacementTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlacementTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
