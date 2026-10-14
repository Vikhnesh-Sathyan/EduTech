import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepDetail } from './prep-detail';

describe('PrepDetail', () => {
  let component: PrepDetail;
  let fixture: ComponentFixture<PrepDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrepDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrepDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
