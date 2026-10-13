import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoubtList } from './doubt-list';

describe('DoubtList', () => {
  let component: DoubtList;
  let fixture: ComponentFixture<DoubtList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoubtList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoubtList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
