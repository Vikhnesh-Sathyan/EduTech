import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestSkill } from './suggest-skill';

describe('SuggestSkill', () => {
  let component: SuggestSkill;
  let fixture: ComponentFixture<SuggestSkill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestSkill]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestSkill);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
