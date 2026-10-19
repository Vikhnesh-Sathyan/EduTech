import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCheatsheet } from './admin-cheatsheet';

describe('AdminCheatsheet', () => {
  let component: AdminCheatsheet;
  let fixture: ComponentFixture<AdminCheatsheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCheatsheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCheatsheet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
