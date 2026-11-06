import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeDiscovery } from './challenge-discovery';

describe('ChallengeDiscovery', () => {
  let component: ChallengeDiscovery;
  let fixture: ComponentFixture<ChallengeDiscovery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeDiscovery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeDiscovery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
