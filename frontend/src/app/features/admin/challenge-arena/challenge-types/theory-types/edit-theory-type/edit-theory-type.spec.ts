import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTheoryType } from './edit-theory-type';

describe('EditTheoryType', () => {
  let component: EditTheoryType;
  let fixture: ComponentFixture<EditTheoryType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTheoryType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTheoryType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
