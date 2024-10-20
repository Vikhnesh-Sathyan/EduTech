import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyTipsComponent } from './study-tips.component';

describe('StudyTipsComponent', () => {
  let component: StudyTipsComponent;
  let fixture: ComponentFixture<StudyTipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyTipsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyTipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
