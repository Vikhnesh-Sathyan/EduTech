import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoubtDetail } from './doubt-detail';

describe('DoubtDetail', () => {
  let component: DoubtDetail;
  let fixture: ComponentFixture<DoubtDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoubtDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoubtDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
