import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoverStudents } from './discover-students';

describe('DiscoverStudents', () => {
  let component: DiscoverStudents;
  let fixture: ComponentFixture<DiscoverStudents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverStudents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscoverStudents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
