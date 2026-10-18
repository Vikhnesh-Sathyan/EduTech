import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingBookmarks } from './coding-bookmarks';

describe('CodingBookmarks', () => {
  let component: CodingBookmarks;
  let fixture: ComponentFixture<CodingBookmarks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingBookmarks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingBookmarks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
