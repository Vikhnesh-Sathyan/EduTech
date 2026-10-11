import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityDoubts } from './community-doubts';

describe('CommunityDoubts', () => {
  let component: CommunityDoubts;
  let fixture: ComponentFixture<CommunityDoubts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityDoubts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityDoubts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
