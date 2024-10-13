import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudytoolsComponent } from './studytools.component';

describe('StudytoolsComponent', () => {
  let component: StudytoolsComponent;
  let fixture: ComponentFixture<StudytoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudytoolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudytoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
