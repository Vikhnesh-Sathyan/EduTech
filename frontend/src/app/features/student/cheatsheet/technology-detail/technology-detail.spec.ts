import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologyDetail } from './technology-detail';

describe('TechnologyDetail', () => {
  let component: TechnologyDetail;
  let fixture: ComponentFixture<TechnologyDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologyDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnologyDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
