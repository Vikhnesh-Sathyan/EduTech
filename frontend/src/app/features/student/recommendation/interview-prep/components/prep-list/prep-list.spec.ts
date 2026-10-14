import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepList } from './prep-list';

describe('PrepList', () => {
  let component: PrepList;
  let fixture: ComponentFixture<PrepList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrepList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrepList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
