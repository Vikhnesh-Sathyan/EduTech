import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeSection } from './welcome-section';

describe('WelcomeSection', () => {
  let component: WelcomeSection;
  let fixture: ComponentFixture<WelcomeSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomeSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
